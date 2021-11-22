import connection from '../../src/database.js';

const userSignature = async (userId, day, product, address) => {
  const {
    city,
    district,
    zipCode,
    street,
    fullName,
  } = address;

  await connection.query('INSERT INTO districts (name) VALUES ($1)', [district]);
  const districtInfo = await connection.query('SELECT * FROM districts WHERE name = $1', [district]);
  const districtId = districtInfo.rows[0].id;

  await connection.query(`INSERT INTO adressees (city, district_id, zip_code, street_number, adresse_name)
      VALUES ($1, $2, $3, $4, $5)`, [city, districtId, zipCode, street, fullName]);

  const addressee = await connection.query('SELECT * FROM adressees WHERE zip_code = $1', [zipCode]);
  const adresseeId = addressee.rows[0].id;

  await connection.query(`INSERT INTO signature (delivery_day_id, adressee_id) 
      VALUES ($1, $2)`, [day, adresseeId]);

  const signature = await connection.query('SELECT * FROM signature WHERE adressee_id = $1', [adresseeId]);
  const signatureId = signature.rows[0].id;

  await connection.query('INSERT INTO signature_products (product_id, signature_id) VALUES ($1, $2)', [product, signatureId]);

  await connection.query('UPDATE users SET signature_id = $1 WHERE id = $2', [signatureId, userId]);

  return {
    id: signatureId,
  };
};

const deleteUserSignature = async () => {
  await connection.query('DELETE FROM signature_products');
  await connection.query('DELETE FROM products');
  await connection.query('DELETE FROM signature');
  await connection.query('DELETE FROM adressees');
  await connection.query('DELETE FROM delivery_days');
  await connection.query("DELETE FROM districts WHERE name = 'RJ'");
};

export {
  userSignature,
  deleteUserSignature,
};
