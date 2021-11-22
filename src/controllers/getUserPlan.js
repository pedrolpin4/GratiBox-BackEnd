import connection from '../database.js';

const getUserPlan = async (req, res) => {
  const { authorization } = req.headers;
  const token = authorization.replace('Bearer ', '');

  const session = await connection.query('SELECT * FROM sessions WHERE token = $1', [token]);
  const userId = session.rows[0].user_id;

  const user = await connection.query('SELECT * FROM users WHERE id = $1', [userId]);

  const signatureId = user.rows[0].signature_id;
  const signature = await connection.query(`SELECT * FROM signature JOIN 
    delivery_days ON delivery_days.id = signature.delivery_day_id JOIN 
    signature_products ON signature_products.signature_id = signature.id
    WHERE signature.id = $1`, [signatureId]);

  res.status(200).send({
    day: signature.rows[0].day,
    products: signature.rows.map((sig) => sig.product_id),
    signDate: signature.rows[0].sign_day,
  });
};

export default getUserPlan;
