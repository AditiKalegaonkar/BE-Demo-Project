const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const HISTORY_FILE = './history.json';

// Save new query
app.post('/history', (req, res) => {
  const newEntry = req.body;

  fs.readFile(HISTORY_FILE, 'utf8', (err, data) => {
    const history = data ? JSON.parse(data) : [];
    history.push(newEntry);

    fs.writeFile(HISTORY_FILE, JSON.stringify(history, null, 2), (err) => {
      if (err) return res.status(500).send('Failed to save history');
      res.status(200).send('Saved');
    });
  });
});

// History
app.get('/history', (req, res) => {
  fs.readFile(HISTORY_FILE, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Failed to read history');
    res.json(JSON.parse(data));
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});