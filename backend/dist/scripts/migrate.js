import fs from 'node:fs/promises';
import path from 'node:path';
import dotenv from 'dotenv';
import { pool } from '../config/db.js';
dotenv.config();
async function ensureMigrationsTable() {
    await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) UNIQUE NOT NULL,
      executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}
async function getAppliedMigrations() {
    const result = await pool.query('SELECT filename FROM schema_migrations ORDER BY id ASC');
    return new Set(result.rows.map((row) => row.filename));
}
async function run() {
    const migrationsDir = path.resolve(process.cwd(), 'db', 'migrations');
    await ensureMigrationsTable();
    const files = (await fs.readdir(migrationsDir))
        .filter((file) => file.toLowerCase().endsWith('.sql'))
        .sort((a, b) => a.localeCompare(b));
    const applied = await getAppliedMigrations();
    for (const file of files) {
        if (applied.has(file))
            continue;
        const sql = await fs.readFile(path.join(migrationsDir, file), 'utf8');
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            await client.query(sql);
            await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
            await client.query('COMMIT');
            console.log(`Applied migration: ${file}`);
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    console.log('Migrations complete');
}
run()
    .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
})
    .finally(async () => {
    await pool.end();
});
//# sourceMappingURL=migrate.js.map