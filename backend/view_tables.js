const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const DB_PATH = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(DB_PATH);

db.serialize(() => {
    console.log("--- DATABASE TABLES ---");
    db.all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'", (err, tables) => {
        if (err) {
            console.error(err);
            return;
        }

        // Count tables to know when to close the DB
        let processed = 0;
        if (tables.length === 0) {
            console.log("No tables found.");
            db.close();
            return;
        }

        tables.forEach(table => {
            db.all(`SELECT * FROM ${table.name}`, (err, rows) => {
                console.log(`\n=== Table: ${table.name.toUpperCase()} (${rows.length} rows) ===`);
                if (err) {
                    console.error(err);
                } else {
                    rows.forEach((row, i) => {
                        console.log(`\n[Record ${i + 1}]`);
                        Object.keys(row).forEach(key => {
                            let val = row[key];
                            // Truncate long strings for readability (like password hashes)
                            if (typeof val === 'string' && val.length > 50) {
                                val = val.substring(0, 47) + '...';
                            }
                            console.log(`${key.padEnd(12)}: ${val}`);
                        });
                    });
                }

                processed++;
                if (processed === tables.length) {
                    console.log("\n--- Done ---");
                    db.close();
                }
            });
        });
    });
});
