const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'database.sqlite');

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) console.error('Error opening database', err);
});

// Initialize Schema
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    pass TEXT,
    role TEXT
  )`);

    db.run(`CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    title TEXT,
    desc TEXT,
    loc TEXT,
    date TEXT,
    cap INTEGER,
    image TEXT,
    createdBy TEXT,
    registered INTEGER DEFAULT 0
  )`);

    db.run(`CREATE TABLE IF NOT EXISTS registrations (
    id TEXT PRIMARY KEY,
    eid TEXT,
    uid TEXT,
    at TEXT,
    phone TEXT,
    details TEXT,
    usn TEXT,
    branch TEXT,
    semester TEXT,
    FOREIGN KEY(eid) REFERENCES events(id),
    FOREIGN KEY(uid) REFERENCES users(id)
  )`, (err) => {
        if (!err) {
            // Attempt to add columns if table already existed without them
            db.run(`ALTER TABLE registrations ADD COLUMN phone TEXT`, () => { });
            db.run(`ALTER TABLE registrations ADD COLUMN details TEXT`, () => { });
            db.run(`ALTER TABLE registrations ADD COLUMN usn TEXT`, () => { });
            db.run(`ALTER TABLE registrations ADD COLUMN branch TEXT`, () => { });
            db.run(`ALTER TABLE registrations ADD COLUMN semester TEXT`, () => { });
        }
    });

    db.run(`CREATE TABLE IF NOT EXISTS reset_tokens (
    token TEXT PRIMARY KEY,
    email TEXT,
    expires INTEGER
  )`);
});

// Helper wrapper for async operations
function run(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

function get(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

function all(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

// Data Access Methods
const dbOps = {
    getUserByEmail: (email) => get('SELECT * FROM users WHERE email = ?', [email]),
    createUser: (u) => run('INSERT INTO users (id, name, email, pass, role) VALUES (?,?,?,?,?)', [u.id, u.name, u.email, u.pass, u.role]),

    getEvents: () => all('SELECT * FROM events'),
    getEventById: (id) => get('SELECT * FROM events WHERE id = ?', [id]),
    createEvent: (e) => run('INSERT INTO events (id, title, desc, loc, date, cap, image, createdBy, registered) VALUES (?,?,?,?,?,?,?,?,?)', [e.id, e.title, e.desc, e.loc, e.date, e.cap, e.image, e.createdBy, e.registered]),
    deleteEvent: (id) => run('DELETE FROM events WHERE id = ?', [id]),

    getRegistration: (eid, uid) => get('SELECT * FROM registrations WHERE eid = ? AND uid = ?', [eid, uid]),
    getRegistrationsCount: (eid) => get('SELECT COUNT(*) as count FROM registrations WHERE eid = ?', [eid]),
    createRegistration: async (r) => {
        await run('INSERT INTO registrations (id, eid, uid, at, phone, details, usn, branch, semester) VALUES (?,?,?,?,?,?,?,?,?)',
            [r.id, r.eid, r.uid, r.at, r.phone, r.details, r.usn, r.branch, r.semester]);
        // Update count in events table
        const c = await get('SELECT COUNT(*) as count FROM registrations WHERE eid = ?', [r.eid]);
        await run('UPDATE events SET registered = ? WHERE id = ?', [c.count, r.eid]);
    },

    // Password Reset
    saveResetToken: (token, email, expires) => run('INSERT OR REPLACE INTO reset_tokens (token, email, expires) VALUES (?,?,?)', [token, email, expires]),
    getResetToken: (token) => get('SELECT * FROM reset_tokens WHERE token = ?', [token]),
    deleteResetToken: (token) => run('DELETE FROM reset_tokens WHERE token = ?', [token]),
    updateUserPassword: (email, pass) => run('UPDATE users SET pass = ? WHERE email = ?', [pass, email])
};

module.exports = dbOps;
