const { v4: uuidv4 } = require('uuid');
const redis = require('redis');

const client = redis.createClient();

const init = async () => {
    await client.connect()
}

const close = async () => {
    await client.disconnect()
}

const requestInfo = (req) => {
    const ip = req.ip;
    const method = req.method;
    const url = req.url;
    const userAgent = req.get('User-Agent');

    let cookieData = {};
    cookieData.ip = ip;
    cookieData.url = url;
    cookieData.userAgent = userAgent;

    return cookieData;
}

const authClient = async (req, res) => {
    const cookieId = uuidv4();

    // one hour cookie
    res.cookie('authToken', cookieId, { maxAge: 3600000, httpOnly: true });

    let cookieData = requestInfo(req);

    await client.setEx(cookieId, 3600, JSON.stringify(cookieData))

    console.log(`Client successfully authenicated (${cookieId}) - ${JSON.stringify(cookieData)}`);
}

const checkCookie = async (req, res, next) => {
    const cookie = req.cookies['authToken'];
  
    if (!cookie) {
        let cookieData = requestInfo(req);
        console.log(`No cookie - ${JSON.stringify(cookieData)}`);
        return res.status(403).send('Forbidden');
    }
  
    const value = await client.get(cookie);

    if (!value) {
        let cookieData = requestInfo(req);
        console.log(`No cookie (${cookie}) wasn't found in Redis - ${JSON.stringify(cookieData)}`);
        return res.status(403).send('Forbidden');
    }
    
    next();
};

module.exports = {
    init,
    close,
    authClient,
    checkCookie
};