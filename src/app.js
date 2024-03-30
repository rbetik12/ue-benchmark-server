const express = require('express');
const { v4: uuidv4 } = require('uuid');
const sqlite3 = require('sqlite3').verbose();

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
        avg_fps REAL,
        cpu_ms REAL,
        gpu_ms REAL,
        memops INTEGER,
        mem_amount REAL,
        run_id TEXT,
        FOREIGN KEY(run_id) REFERENCES RunInfo(run_id)
    )`);
});

app.use(express.json());

app.post('/newRun', (req, res) => {
    const runId = uuidv4();

    db.run(`INSERT INTO RunInfo (run_id) VALUES (?)`, [runId], (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
    });

    res.json({ id: runId });
});

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