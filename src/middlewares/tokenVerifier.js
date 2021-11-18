/* eslint-disable consistent-return */
import connection from '../database.js';

const tokenVerifier = async (req, res, next) => {
  const { authorization } = req.headers;
  const token = authorization.replace('Bearer ', '');

  const result = await connection.query('SELECT * FROM sessions WHERE token = $1', [token]);

  if (!result.rowCount) {
    return res.sendStatus(401);
  }

  next();
};

export default tokenVerifier;
