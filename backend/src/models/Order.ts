import { query } from '../config/db.js';

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed';

export interface IOrder {
  _id: string;
  id: string;
  userId: string;
  queueNumber: number;
  items: string[];
  status: OrderStatus;
  totalPrice: number;
  estimatedTime: number;
  createdAt: Date;
}

export interface IOrderWithUser extends Omit<IOrder, 'userId'> {
  userId: {
    _id: string;
    username: string;
    displayName: string;
  };
}

interface OrderRow {
  _id: string;
  id: string;
  userId: string;
  queueNumber: number;
  items: string[];
  status: OrderStatus;
  totalPrice: number | string;
  estimatedTime: number;
  createdAt: Date;
}

interface OrderWithUserRow extends OrderRow {
  userRefId: string;
  username: string;
  displayName: string;
}

function toOrder(row: OrderRow): IOrder {
  return {
    _id: row._id,
    id: row.id,
    userId: row.userId,
    queueNumber: row.queueNumber,
    items: row.items,
    status: row.status,
    totalPrice: Number(row.totalPrice),
    estimatedTime: row.estimatedTime,
    createdAt: row.createdAt,
  };
}

export async function createOrder(input: {
  userId: string;
  queueNumber: number;
  items: string[];
  totalPrice: number;
  estimatedTime: number;
  status?: OrderStatus;
}): Promise<IOrder> {
  const result = await query<OrderRow>(
    `INSERT INTO orders (user_id, queue_number, items, status, total_price, estimated_time)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING
      id AS "_id",
      id,
      user_id AS "userId",
      queue_number AS "queueNumber",
      items,
      status,
      total_price AS "totalPrice",
      estimated_time AS "estimatedTime",
      created_at AS "createdAt"`,
    [
      input.userId,
      input.queueNumber,
      input.items,
      input.status ?? 'pending',
      input.totalPrice,
      input.estimatedTime,
    ],
  );

  return toOrder(result.rows[0]);
}

export async function findOrdersByUser(userId: string): Promise<IOrder[]> {
  const result = await query<OrderRow>(
    `SELECT
      id AS "_id",
      id,
      user_id AS "userId",
      queue_number AS "queueNumber",
      items,
      status,
      total_price AS "totalPrice",
      estimated_time AS "estimatedTime",
      created_at AS "createdAt"
     FROM orders
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId],
  );

  return result.rows.map(toOrder);
}

export async function findOrderByIdForUser(orderId: string, userId: string): Promise<IOrder | null> {
  const result = await query<OrderRow>(
    `SELECT
      id AS "_id",
      id,
      user_id AS "userId",
      queue_number AS "queueNumber",
      items,
      status,
      total_price AS "totalPrice",
      estimated_time AS "estimatedTime",
      created_at AS "createdAt"
     FROM orders
     WHERE id = $1 AND user_id = $2
     LIMIT 1`,
    [orderId, userId],
  );

  if (result.rows.length === 0) return null;
  return toOrder(result.rows[0]);
}

export async function countActiveOrders(): Promise<number> {
  const result = await query<{ count: string }>(
    `SELECT COUNT(*)::text AS count
     FROM orders
     WHERE status = ANY($1::text[])`,
    [['pending', 'preparing']],
  );
  return parseInt(result.rows[0].count, 10);
}

export async function averageActiveOrderTime(): Promise<number> {
  const result = await query<{ avgTime: number | null }>(
    `SELECT ROUND(AVG(estimated_time))::int AS "avgTime"
     FROM orders
     WHERE status = ANY($1::text[])`,
    [['pending', 'preparing']],
  );

  return result.rows[0].avgTime ?? 0;
}

export async function findAllQueueOrders(): Promise<Array<Pick<IOrder, '_id' | 'queueNumber' | 'status' | 'estimatedTime' | 'createdAt' | 'totalPrice'>>> {
  const result = await query<OrderRow>(
    `SELECT
      id AS "_id",
      id,
      user_id AS "userId",
      queue_number AS "queueNumber",
      items,
      status,
      total_price AS "totalPrice",
      estimated_time AS "estimatedTime",
      created_at AS "createdAt"
     FROM orders
     WHERE status = ANY($1::text[])
     ORDER BY queue_number ASC`,
    [['pending', 'preparing', 'ready']],
  );

  return result.rows.map((row) => ({
    _id: row._id,
    queueNumber: row.queueNumber,
    status: row.status,
    estimatedTime: row.estimatedTime,
    createdAt: row.createdAt,
    totalPrice: Number(row.totalPrice),
  }));
}

export async function findUserActiveOrder(userId: string): Promise<IOrder | null> {
  const result = await query<OrderRow>(
    `SELECT
      id AS "_id",
      id,
      user_id AS "userId",
      queue_number AS "queueNumber",
      items,
      status,
      total_price AS "totalPrice",
      estimated_time AS "estimatedTime",
      created_at AS "createdAt"
     FROM orders
     WHERE user_id = $1 AND status = ANY($2::text[])
     ORDER BY created_at DESC
     LIMIT 1`,
    [userId, ['pending', 'preparing', 'ready']],
  );

  if (result.rows.length === 0) return null;
  return toOrder(result.rows[0]);
}

export async function countOrdersAhead(queueNumber: number): Promise<number> {
  const result = await query<{ count: string }>(
    `SELECT COUNT(*)::text AS count
     FROM orders
     WHERE queue_number < $1 AND status = ANY($2::text[])`,
    [queueNumber, ['pending', 'preparing', 'ready']],
  );
  return parseInt(result.rows[0].count, 10);
}

export async function countOrdersInQueue(): Promise<number> {
  const result = await query<{ count: string }>(
    `SELECT COUNT(*)::text AS count
     FROM orders
     WHERE status = ANY($1::text[])`,
    [['pending', 'preparing', 'ready']],
  );
  return parseInt(result.rows[0].count, 10);
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<IOrder | null> {
  const result = await query<OrderRow>(
    `UPDATE orders
     SET status = $2
     WHERE id = $1
     RETURNING
      id AS "_id",
      id,
      user_id AS "userId",
      queue_number AS "queueNumber",
      items,
      status,
      total_price AS "totalPrice",
      estimated_time AS "estimatedTime",
      created_at AS "createdAt"`,
    [orderId, status],
  );

  if (result.rows.length === 0) return null;
  return toOrder(result.rows[0]);
}

export async function findAllOrdersWithUser(): Promise<IOrderWithUser[]> {
  const result = await query<OrderWithUserRow>(
    `SELECT
      o.id AS "_id",
      o.id,
      o.user_id AS "userId",
      o.queue_number AS "queueNumber",
      o.items,
      o.status,
      o.total_price AS "totalPrice",
      o.estimated_time AS "estimatedTime",
      o.created_at AS "createdAt",
      u.id AS "userRefId",
      u.username,
      u.display_name AS "displayName"
     FROM orders o
     JOIN users u ON u.id = o.user_id
     ORDER BY o.created_at DESC`,
  );

  return result.rows.map((row) => ({
    ...toOrder(row),
    userId: {
      _id: row.userRefId,
      username: row.username,
      displayName: row.displayName,
    },
  }));
}

export async function updateOrderStatusWithUser(
  orderId: string,
  status: OrderStatus,
): Promise<IOrderWithUser | null> {
  const result = await query<OrderWithUserRow>(
    `UPDATE orders o
     SET status = $2
     FROM users u
     WHERE o.id = $1 AND u.id = o.user_id
     RETURNING
      o.id AS "_id",
      o.id,
      o.user_id AS "userId",
      o.queue_number AS "queueNumber",
      o.items,
      o.status,
      o.total_price AS "totalPrice",
      o.estimated_time AS "estimatedTime",
      o.created_at AS "createdAt",
      u.id AS "userRefId",
      u.username,
      u.display_name AS "displayName"`,
    [orderId, status],
  );

  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return {
    ...toOrder(row),
    userId: {
      _id: row.userRefId,
      username: row.username,
      displayName: row.displayName,
    },
  };
}
