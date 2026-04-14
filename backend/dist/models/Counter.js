import { query } from '../config/db.js';
export async function getNextQueueNumber() {
    const result = await query(`INSERT INTO counters (name, seq)
     VALUES ('queueNumber', 1)
     ON CONFLICT (name)
     DO UPDATE SET seq = counters.seq + 1
     RETURNING seq`);
    return result.rows[0].seq;
}
//# sourceMappingURL=Counter.js.map