/* eslint-disable dot-notation */
/* eslint-disable consistent-return */
import connection from '../database.js';

const planVerifier = async (req, res, next) => {
  const { authorization } = req.headers;
  const token = authorization.replace('Bearer ', '');

  const sessionResult = await connection.query('SELECT * FROM sessions WHERE token = $1', [token]);

  if (!sessionResult.rowCount) {
    return res.sendStatus(401);
  }

  const userId = sessionResult.rows[0]['user_id'];

  const userResult = await connection.query('SELECT * FROM users WHERE id = $1', [userId]);

  if (!userResult.rows[0]['signature_id']) {
    return res.sendStatus(403);
  }

  next();
};

export default planVerifier;
