import { v4 as uuid } from 'uuid';
import bcrypt from 'bcrypt';
import connection from '../database.js';
import { signInValidation, signUpValidation } from '../validations/joiValidations.js';

async function postSignUp(req, res) {
  const {
    name,
    email,
    password,
  } = req.body;

  const encriptedPassword = bcrypt.hashSync(`${password}`, 10);

  const validation = signUpValidation.validate(req.body);
  if (validation.error) {
    res.status(400).send({
      message: validation.error.details[0].message,
    });
    return;
  }

  try {
    const users = await connection.query('SELECT * FROM users');
    const isValidEmail = users.rows.some((user) => user.email === req.body.email);

    if (isValidEmail) {
      res.status(409).send({
        message: 'Looks like this email is already on our database',
      });
      return;
    }

    await connection.query(`INSERT INTO users (name, email, password) 
        VALUES ($1, $2, '${encriptedPassword}')`, [name, email]);
    res.sendStatus(201);
  } catch (e) {
    res.sendStatus(500);
  }
}

const postSignIn = async (req, res) => {
  const {
    email,
    password,
  } = req.body;

  if (signInValidation.validate(req.body).error) {
    res.sendStatus(400);
    return;
  }

  try {
    const result = await connection.query(`SELECT * FROM users
        WHERE email = $1`, [email]);

    const user = result.rows[0];

    if (!user) {
      res.sendStatus(404);
      return;
    }

    if (!bcrypt.compareSync(password, user.password)) {
      res.sendStatus(401);
      return;
    }

    const token = uuid();
    await connection.query(`INSERT INTO sessions (user_id, token) 
          VALUES($1, $2)`, [user.id, token]);

    res.send({
      token,
      user,
    }).status(200);
  } catch (error) {
    res.sendStatus(500);
  }
};

export {
  postSignUp,
  postSignIn,
};
