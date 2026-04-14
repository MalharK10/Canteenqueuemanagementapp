import { query } from '../config/db.js';
function toMenuItem(row) {
    return {
        _id: row._id,
        id: row.id,
        name: row.name,
        category: row.category,
        price: Number(row.price),
        image: row.image,
        prepTime: row.prepTime,
        description: row.description,
    };
}
export async function findMenuItems(category) {
    const result = await query(`SELECT
      id AS "_id",
      id,
      name,
      category,
      price,
      image,
      prep_time AS "prepTime",
      description
     FROM menu_items
     ${category ? 'WHERE category = $1' : ''}
     ORDER BY category ASC, name ASC`, category ? [category] : undefined);
    return result.rows.map(toMenuItem);
}
export async function findMenuItemById(id) {
    const result = await query(`SELECT
      id AS "_id",
      id,
      name,
      category,
      price,
      image,
      prep_time AS "prepTime",
      description
     FROM menu_items
     WHERE id = $1
     LIMIT 1`, [id]);
    if (result.rows.length === 0)
        return null;
    return toMenuItem(result.rows[0]);
}
export async function createMenuItem(input) {
    const result = await query(`INSERT INTO menu_items (name, category, price, image, prep_time, description)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING
      id AS "_id",
      id,
      name,
      category,
      price,
      image,
      prep_time AS "prepTime",
      description`, [input.name, input.category, input.price, input.image, input.prepTime, input.description]);
    return toMenuItem(result.rows[0]);
}
export async function updateMenuItem(id, input) {
    const result = await query(`UPDATE menu_items
     SET
      name = COALESCE($2, name),
      category = COALESCE($3, category),
      price = COALESCE($4, price),
      image = COALESCE($5, image),
      prep_time = COALESCE($6, prep_time),
      description = COALESCE($7, description)
     WHERE id = $1
     RETURNING
      id AS "_id",
      id,
      name,
      category,
      price,
      image,
      prep_time AS "prepTime",
      description`, [
        id,
        input.name ?? null,
        input.category ?? null,
        input.price ?? null,
        input.image ?? null,
        input.prepTime ?? null,
        input.description ?? null,
    ]);
    if (result.rows.length === 0)
        return null;
    return toMenuItem(result.rows[0]);
}
export async function deleteMenuItem(id) {
    const result = await query('DELETE FROM menu_items WHERE id = $1 RETURNING id', [id]);
    return (result.rowCount ?? 0) > 0;
}
export async function countMenuItems() {
    const result = await query('SELECT COUNT(*)::text AS count FROM menu_items');
    return parseInt(result.rows[0].count, 10);
}
export async function insertManyMenuItems(items) {
    for (const item of items) {
        await query(`INSERT INTO menu_items (name, category, price, image, prep_time, description)
       VALUES ($1, $2, $3, $4, $5, $6)`, [item.name, item.category, item.price, item.image, item.prepTime, item.description]);
    }
}
//# sourceMappingURL=MenuItem.js.map