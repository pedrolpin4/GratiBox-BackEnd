import { v4 as uuid } from 'uuid';
import bcrypt from 'bcrypt';
import connection from '../../src/database.js';

const createUser = async (name, email, password) => {
  const encryptedPassword = bcrypt.hashSync(password, 10);

  await connection.query(`INSERT INTO users (name, email, password) VALUES
    ($1, $2, $3)`, [name, email, encryptedPassword]);

  const token = uuid();

  const user = await connection.query('SELECT * FROM users WHERE email = $1', [email]);

  const userId = user.rows[0].id;

  await connection.query('INSERT INTO sessions (user_id, token) VALUES ($1, $2)', [userId, token]);

  return {
    id: userId,
    token,
  };
};

export default createUser;
