import { Pool, QueryResult, QueryResultRow } from 'pg';
export declare const pool: Pool;
export declare function query<T extends QueryResultRow>(text: string, params?: unknown[]): Promise<QueryResult<T>>;
export declare function connectDB(): Promise<void>;
//# sourceMappingURL=db.d.ts.map