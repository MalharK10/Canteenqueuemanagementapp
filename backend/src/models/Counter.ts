import { query } from '../config/db.js';

export interface ICounter {
  name: string;
  seq: number;
}

export async function getNextQueueNumber(): Promise<number> {
  const result = await query<{ seq: number }>(
    `INSERT INTO counters (name, seq)
     VALUES ('queueNumber', 1)
     ON CONFLICT (name)
     DO UPDATE SET seq = counters.seq + 1
     RETURNING seq`,
  );
  return result.rows[0].seq;
}
