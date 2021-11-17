import dotenv from 'dotenv';

let path;

switch (process.env.NODE_ENV) {
  case 'prod':
    path = '.env.prod';
    break;
  case 'test':
    path = '.env.test';
    break;
  default:
    path = '.env.dev';
}

dotenv.config({
  path,
});
