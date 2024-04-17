const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error(err.message);
  } 
    db.run("CREATE TABLE IF NOT EXISTS rankings (name TEXT NOT NULL, highscore INTEGER NOT NULL)")
    console.log('Connected to the ranking database.');
});

app.use(express.json());

// GET all rankings
app.get('/rankings', (req, res) => {
  db.all('SELECT * FROM rankings ORDER BY highscore DESC', (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Internal server error');
    } else {
      res.send(rows);
    }
  });
});

// POST new ranking
app.post('/rankings/', (req, res) => {
  const {name, highscore }  = req.body;
  if (!name || !highscore) {
    res.status(400).send('Score are required');
  } else {
    const sql = 'INSERT INTO rankings (name, highscore) VALUES (?, ?)';
    db.run(sql, [name, highscore], function(err) {
      if (err) {
        console.error(err.message);
        res.status(500).send('Internal server error');
      } else {
        const id = this.lastID;
        res.status(201).send({ id, name, highscore });
      }
    });
  }
});

// PUT update high score by ID
app.put('/rankings/:id', (req, res) => {
  const { id } = req.params;
  const { highscore } = req.body;
  if (!highscore) {
    res.status(400).send('Score is required');
  } else {
    const sql = 'UPDATE rankings SET highscore = ? WHERE rowid = ?';
    db.run(sql, [highscore, id], function(err) {
      if (err) {
        console.error(err.message);
        res.status(500).send('Internal server error');
      } else if (this.changes === 0) {
        res.status(404).send('User not found');
      } else {
        res.status(200).send({ id, highscore });
      }
    });
  }
});

// DELETE product by ID
app.delete('/rankings/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM rankings WHERE rowid = ?', [id], function(err) {
    if (err) {
      console.error(err.message);
      res.status(500).send('Internal server error');
    } else if (this.changes === 0) {
      res.status(404).send('ID not found');
    } else {
      res.status(204).send();
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}.`);
});