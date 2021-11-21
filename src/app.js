import express from 'express';
import cors from 'cors';
import tokenVerifier from './middlewares/tokenVerifier.js';
import { postSignIn, postSignUp } from './controllers/auth.js';
import { getPlanOptions, registerPlan } from './controllers/signPlan.js';

const app = express();
app.use(express.json());
app.use(cors());

app.post('/sign-up', (req, res) => postSignUp(req, res));
app.post('/sign-in', (req, res) => postSignIn(req, res));

app.get('/plans-options', tokenVerifier, (req, res) => getPlanOptions(req, res));
app.post('/plans-options', tokenVerifier, (req, res) => registerPlan(req, res));

app.get('/health', (req, res) => {
  res.sendStatus(200);
});

export default app;
