import connection from '../../src/database.js';

const createSignature = async (productName, dayName) => {
  await connection.query('INSERT INTO products (name) VALUES ($1)', [productName]);
  await connection.query('INSERT INTO delivery_days (day) VALUES ($1)', [dayName]);
  const day = await connection.query('SELECT * FROM delivery_days WHERE day = $1', [dayName]);
  const dayId = day.rows[0].id;
  const products = await connection.query('SELECT * FROM products WHERE name = $1', [productName]);
  const productId = products.rows[0].id;

  return {
    product: productId,
    day: dayId,
  };
};

const deleteSignature = async (productId, dayId) => {
  await connection.query('DELETE FROM signature_products WHERE product_id = $1', [productId]);
  await connection.query('DELETE FROM products WHERE id = $1', [productId]);
  await connection.query('DELETE FROM signature WHERE delivery_day_id = $1', [dayId]);
  await connection.query('DELETE FROM delivery_days WHERE id = $1', [dayId]);
  await connection.query('DELETE FROM adressees;');
};

export {
  createSignature,
  deleteSignature,
};
