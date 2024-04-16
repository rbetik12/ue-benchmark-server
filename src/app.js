const express = require('express');
const { v4: uuidv4 } = require('uuid');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cookieParser = require('cookie-parser');
const math = require('./math')
const auth = require('./auth')

const app = express();
const PORT = 3000;

const db = new sqlite3.Database('runs.db');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS RunInfo (
        runId TEXT PRIMARY KEY,
        name TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS RunData (
        id INTEGER PRIMARY KEY,
        fps REAL,
        cpuTime REAL,
        gpuTime REAL,
        memopsAmount INTEGER,
        memAmount REAL,
        runId TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(runId) REFERENCES RunInfo(runId)
    )`);
});

app.use(express.json());

app.use(cookieParser());

app.use(express.static(path.join('../' + __dirname, 'public')));

const server = app.listen(PORT, async () => {
    auth.init();
    console.log(`Server is running on port ${PORT}`);
});

server.on('close', () => {
    auth.close();
    db.close((err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Database connection closed.');
    });
});

app.post('/api/auth', async (req, res) => {
    await auth.authClient(req, res);
    res.sendStatus(200);
})

app.get('/api/auth/check', auth.checkCookie, (req, res) => {
    res.sendStatus(201);
})

app.post('/api/run/new', auth.checkCookie, (req, res) => {
    const runId = uuidv4();

    db.run(`INSERT INTO RunInfo (runId) VALUES (?)`, [runId], (err) => {
        if (err) {
            console.log(err.message);
            return res.status(400).json({ error: err.message });
        }

        console.log(`New run id was created: ${runId}`);
        res.json({ id: runId });
    });
});

app.get('/api/run/all', (req, res) => {
    console.log(`Runs list was requested`);

    db.all('SELECT * FROM RunInfo', (err, rows) => {
        if (err) {
            console.log(err.message);
            return res.status(400).json({ error: err.message });
        }

        res.json(rows);
    });
});

app.post('/api/run/:id/data', auth.checkCookie, (req, res) => {
    const runData = req.body

    db.run(`INSERT INTO RunData (fps, cpuTime, gpuTime, memopsAmount, memAmount, runId) VALUES (?, ?, ?, ?, ?, ?)`, 
    [runData['fps'], runData['cpuTime'], runData['gpuTime'], runData['memopsAmount'], runData['memAmount'], req.params.id], 
    (err) => {
        if (err) {
            console.log(err.message);
            return res.status(400).json({ error: err.message });
        }

        res.sendStatus(200)
    });
});

app.get('/api/run/:id/data', (req, res) => {
    const runId = req.params.id;

    console.log(`Run "${runId}" data was requested`);

    db.all(`SELECT * FROM RunData WHERE runId='${runId}'`, (err, rows) => {
        if (err) {
            console.log(err.message);
            return res.status(400).json({ error: err.message });
        }

        let processedJson = rows.map(item => {
            const { id, run_id, ...rest } = item;
            return rest;
        });

        const mode = req.query.mode;
        if (mode && mode === 'average') {
            processedJson = math.averageData(processedJson);
        }

        res.json(processedJson);
    });
});

app.post('/api/run/:id/', auth.checkCookie, (req, res) => {
    const runId = req.params.id;
    const name = req.query.name;

    db.run(`UPDATE RunInfo SET name='${name}' WHERE runId='${runId}'`, (err, rows) => {
        if (err) {
            console.log(err.message);
            return res.status(400).json({ error: err.message });
        }

        console.log(`New name '${name}' for run "${runId}" was assigned`);

        res.sendStatus(200);
    });
});