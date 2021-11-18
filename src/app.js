import express from 'express';
import cors from 'cors';
import tokenVerifier from './middlewares/tokenVerifier.js';
import { postSignIn, postSignUp } from './controllers/registration.js';

const app = express();
app.use(express.json());
app.use(cors());
app.use(tokenVerifier, '/signatures');

app.post('/sign-up', (req, res) => postSignUp(req, res));
app.post('/sign-in', (req, res) => postSignIn(req, res));

app.get('/health', (req, res) => {
  res.sendStatus(200);
});

export default app;
