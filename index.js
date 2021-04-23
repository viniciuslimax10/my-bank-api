import express from 'express';
import { promises } from 'fs';
import winston from 'winston';

import cors from 'cors';

const app = express();
import accountsRouter from './routes/accounts.js';

const readFile = promises.readFile;
const writeFile = promises.writeFile;

global.fileName = 'accounts.json';

const { combine, timestamp, label, printf } = winston.format;
const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

global.logger = winston.createLogger({
  level: 'silly',
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'my-bank-api.log' }),
  ],
  format: combine(label({ label: 'my-bank-api' }), timestamp(), myFormat),
});

app.use(cors());
app.use(express.json());
app.use('/account', accountsRouter);

app.listen(3000, async () => {
  try {
    await readFile(global.fileName, 'utf8');
    logger.info('API Started');
  } catch (err) {
    const initialJson = {
      nextId: 1,
      accounts: [],
    };
    writeFile(global.fileName, JSON.stringify(initialJson), (err) => {
      logger.error(err);
    });
  }
});
