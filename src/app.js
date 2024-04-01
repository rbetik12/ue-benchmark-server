const express = require('express');
const { v4: uuidv4 } = require('uuid');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const math = require('./math')

const app = express();
const PORT = 3000;

const db = new sqlite3.Database('runs.db');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS RunInfo (
        run_id TEXT PRIMARY KEY,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS RunData (
        id INTEGER PRIMARY KEY,
        fps REAL,
        cpu_time REAL,
        gpu_time REAL,
        memops_amount INTEGER,
        mem_amount REAL,
        run_id TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(run_id) REFERENCES RunInfo(run_id)
    )`);
});

app.use(express.json());

app.use(express.static(path.join('../' + __dirname, 'public')));

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

server.on('close', () => {
    db.close((err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Database connection closed.');
    });
});

app.post('/api/run/new', (req, res) => {
    const runId = uuidv4();

    db.run(`INSERT INTO RunInfo (run_id) VALUES (?)`, [runId], (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        console.log(`New run id was created: ${runId}`);
        res.json({ id: runId });
    });
});

app.get('/api/run/all', (req, res) => {
    console.log(`Runs list was requested`);

    db.all('SELECT * FROM RunInfo', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.json(rows);
    });
});

app.post('/api/run/', (req, res) => {
    const runData = req.body

    db.run(`INSERT INTO RunData (fps, cpu_time, gpu_time, memops_amount, mem_amount, run_id) VALUES (?, ?, ?, ?, ?, ?)`, 
    [runData['fps'], runData['cpu_time'], runData['gpu_time'], runData['memops_amount'], runData['mem_amount'], runData['run_id']], 
    (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.sendStatus(200)
    });
});

app.get('/api/run/:id/data', (req, res) => {
    const runId = req.params.id;

    console.log(`Run "${runId}" data was requested`);

    db.all(`SELECT * FROM RunData WHERE run_id='${runId}'`, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        let processedJson = rows.map(item => {
            const { id, run_id, ...rest } = item; // Extract 'id' and 'run_id'
            return rest;
        });

        const mode = req.query.mode;
        if (mode && mode === 'average') {
            processedJson = math.averageData(processedJson);
        }

        res.json(processedJson);
    });
});