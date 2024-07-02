const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(cors());

const db = new sqlite3.Database('./weatherApp.db', (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to the SQLite database.');
        db.run(`
            CREATE TABLE IF NOT EXISTS roles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                role_name TEXT UNIQUE
            );
        `, (err) => {
            if (err) {
                return console.error(err.message);
            }
        
            db.run('INSERT OR IGNORE INTO roles (role_name) VALUES ("Admin"), ("User");', (err) => {
                if (err) {
                    return console.error(err.message);
                }
            });
        });

        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE,
                password TEXT,
                profile TEXT,
                role_id INTEGER,
                FOREIGN KEY (role_id) REFERENCES roles (id)
            );
        `);
        db.run(`
            CREATE TABLE IF NOT EXISTS locations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                description TEXT UNIQUE,
                user_email TEXT,
                FOREIGN KEY (user_email) REFERENCES users (email)
            );
        `);
        db.run(`
            CREATE TABLE IF NOT EXISTS notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                location_name TEXT,
                description TEXT
            );
        `);
    }
});

let sessions = {};

app.post('/api/register', (req, res) => {
    const { email, password } = req.body;
    
    db.run('INSERT INTO users (email, password, profile, role_id) VALUES (?, ?, ?, 2)', [email, password, "{}"], function (err) {
        if (err) {
            res.status(500).json({ message: "Error registering user" });
        } else {
            res.status(201).json({ message: "User registered successfully" });
        }
    });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    db.get('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, row) => {
        if (err) {
            res.status(500).json({ message: "Internal server error" });
        } else if (row) {
            const token = Math.random().toString(36).substring(2);
            sessions[token] = { email };
            res.json({ token });
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    });
});

app.post('/api/logout', (req, res) => {
    const { token } = req.body;
    delete sessions[token];
    res.json({ message: "Logged out successfully" });
});

app.route('/api/users/profile')
    .get((req, res) => {
        const { token } = req.headers;
        const session = sessions[token];
        if (session) {
            db.get('SELECT * FROM users WHERE email = ?', [session.email], (err, row) => {
                if (err) {
                    res.status(500).json({ message: "Internal server error" });
                } else if (row) {
                    res.json({ email: row.email, profile: JSON.parse(row.profile) });
                } else {
                    res.status(404).json({ message: "User not found" });
                }
            });
        } else {
            res.status(401).json({ message: "Unauthorized" });
        }
    })
    .put((req, res) => {
        const { token } = req.headers;
        const session = sessions[token];
        if (session) {
            db.run('UPDATE users SET profile = ? WHERE email = ?', [JSON.stringify(req.body), session.email], function (err) {
                if (err) {
                    res.status(500).json({ message: "Internal server error" });
                } else {
                    res.json({ email: session.email, profile: req.body });
                }
            });
        } else {
            res.status(401).json({ message: "Unauthorized" });
        }
    });

app.route('/api/notifications')
    .post((req, res) => {
        const { token } = req.headers;
        const session = sessions[token];
        if (session) {
            const { location_name, description } = req.body;
            db.run('INSERT INTO notifications (location_name, description) VALUES (?, ?)', [location_name, description], function (err) {
                if (err) {
                    res.status(500).json({ message: "Internal server error" });
                } else {
                    res.status(201).json({ location_name, description });
                }
            });
        } else {
            res.status(401).json({ message: "Unauthorized" });
        }
    })
    .get((req, res) => {
        const { token } = req.headers;
        const session = sessions[token];
        if (session) {
            db.all('SELECT * FROM notifications', (err, rows) => {
                if (err) {
                    res.status(500).json({ message: "Internal server error" });
                } else {
                    res.json(rows);
                } 
            });
        } else {
            res.status(401).json({ message: "Unauthorized" });
        }
    })

app.route('/api/locations')
    .get((req, res) => {
        const { token } = req.headers;
        const session = sessions[token];
        if (session) {
            const user_email = req.query.user_email;
            db.all('SELECT description FROM locations WHERE user_email = ?', [user_email], (err, rows) => {
                if (err) {
                    res.status(500).json({ message: "Internal server error" });
                } else {
                    res.json(rows);
                }
            });
        } else {
            res.status(401).json({ message: "Unauthorized" });
        }
    })
    .post((req, res) => {
        const { token } = req.headers;
        const session = sessions[token];
        if (session) {
            const { name, description, user_email } = req.body;
            db.run('INSERT OR IGNORE INTO locations (name, description, user_email) VALUES (?, ?, ?)', [name, description, user_email], function (err) {
                if (err) {
                    res.status(500).json({ message: "Internal server error" });
                } else {
                    res.status(201).json({ name, description, user_email });
                }
            });
        } else {
            res.status(401).json({ message: "Unauthorized" });
        }
    })
    .put((req, res) => {
        const { token } = req.headers;
        const session = sessions[token];
        if (session) {
            const { id, name, description } = req.body;
            db.run('UPDATE locations SET name = ?, description = ? WHERE id = ?', [name, description, id], function (err) {
                if (err) {
                    res.status(500).json({ message: "Internal server error" });
                } else if (this.changes === 0) {
                    res.status(404).json({ message: "Location not found" });
                } else {
                    res.json({ id, name, description });
                }
            });
        } else {
            res.status(401).json({ message: "Unauthorized" });
        }
    })
    .delete((req, res) => {
        const { token } = req.headers;
        const session = sessions[token];
        if (session) {
            const user_email = req.query.user_email;
            const name = req.query.name;
            db.run('DELETE FROM locations WHERE name = ? AND user_email = ?', [name, user_email], function (err) {
                if (err) {
                    res.status(500).json({ message: "Internal server error" });
                } else if (this.changes === 0) {
                    res.status(404).json({ message: "Location not found" });
                } else {
                    res.json({ message: "Location deleted" });
                }
            });
        } else {
            res.status(401).json({ message: "Unauthorized" });
        }
    });

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
