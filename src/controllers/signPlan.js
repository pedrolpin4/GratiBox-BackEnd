import connection from '../database.js';
import { signatureValidation } from '../validations/joiValidations.js';

const getPlanOptions = async (req, res) => {
  try {
    const dayPlans = await connection.query('SELECT * FROM delivery_days');
    const products = await connection.query('SELECT * FROM products');
    const districts = await connection.query('SELECT * FROM districts');
    const planOptions = {
      days: dayPlans.rows,
      products: products.rows,
      districts: districts.rows,
    };

    res.send(planOptions);
  } catch (error) {
    res.sendStatus(500);
  }
};

const registerPlan = async (req, res) => {
  const {
    day,
    products,
    streetNumber,
    city,
    district,
    zipCode,
    fullName,
    userId,
  } = req.body;

  if (signatureValidation.validate(req.body).error) {
    res.status(400).send({
      message: signatureValidation.validate(req.body).error.details[0].message,
    });
    return;
  }

  try {
    const verifyAddressee = await connection.query('SELECT * FROM adressees WHERE zip_code = $1', [zipCode]);
    if (verifyAddressee.rowCount) {
      res.sendStatus(409);
      return;
    }

    await connection.query(`INSERT INTO adressees (city, district_id, zip_code, street_number, adresse_name)
      VALUES ($1, $2, $3, $4, $5)`, [city, district, zipCode, streetNumber, fullName]);

    const addressee = await connection.query('SELECT * FROM adressees WHERE zip_code = $1', [zipCode]);
    const adresseeId = addressee.rows[0].id;

    await connection.query(`INSERT INTO signature (delivery_day_id, adressee_id) 
      VALUES ($1, $2)`, [day, adresseeId]);

    const signature = await connection.query('SELECT * FROM signature WHERE adressee_id = $1', [adresseeId]);
    const signatureId = signature.rows[0].id;

    let requisitionQuery = 'INSERT INTO signature_products (product_id, signature_id) VALUES ';

    products.forEach((prod, i) => {
      if (i + 1 === products.length) {
        requisitionQuery += `(${prod}, ${signatureId})`;
        return;
      }

      requisitionQuery += `(${prod}, ${signatureId}), `;
    });

    await connection.query(requisitionQuery);
    await connection.query('UPDATE users SET signature_id = $1 WHERE id = $2', [signatureId, userId]);

    res.status(201).send({
      signatureId,
    });
  } catch (error) {
    res.sendStatus(500);
  }
};

export {
  getPlanOptions,
  registerPlan,
};
