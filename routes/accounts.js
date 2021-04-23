import express from 'express';
import { promises } from 'fs';

var router = express.Router();

const readFile = promises.readFile;
const writeFile = promises.writeFile;

router.post('/', async (req, res) => {
  let accountreq = req.body;
  let account = {
    name: accountreq.name,
    balance: accountreq.balance,
  };

  try {
    if (account.name == null || account.balance == null) {
      res.status(400).send('Incorrect PARAMS');
      logger.error(`POST /Account - Incorrect PARAMS`);
    }
    let data = await readFile(global.fileName, 'utf8');
    let json = JSON.parse(data);
    account = { id: json.nextId++, ...account };
    json.accounts.push(account);
    await writeFile(global.fileName, JSON.stringify(json));
    res.end();
    logger.info(`POST /Account - ${JSON.stringify(account)}`);
  } catch (err) {
    res.status(400).send({ error: err.message });
    logger.error(`POST /Account - ${err.message}`);
  }
});

router.get('/', async (_, res) => {
  try {
    let data = await readFile(global.fileName, 'utf8');
    let json = JSON.parse(data);
    delete json.nextId;
    res.send(json);
    logger.info('GET /Account');
  } catch (err) {
    res.status(400).send({ error: err.message });
    logger.error(`GET /Account - ${err.message}`);
  }
});

router.get('/:id', async (req, res) => {
  try {
    let data = await readFile(global.fileName, 'utf8');
    let json = JSON.parse(data);
    const account = json.accounts.find(
      (account) => account.id === parseInt(req.params.id, 10)
    );
    if (account) {
      res.send(account);
      logger.info(`GET /Account/:id - ${JSON.stringify(account)}`);
    } else {
      res.end();
      logger.info('GET /Account/:id');
    }
  } catch (err) {
    res.status(400).send({ error: err.message });
    logger.error(`GET /Account - ${err.message}`);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    let data = await readFile(global.fileName, 'utf8');
    let json = JSON.parse(data);
    let accounts = json.accounts.filter(
      (account) => account.id !== parseInt(req.params.id, 10)
    );
    json.accounts = accounts;

    await writeFile(global.fileName, JSON.stringify(json));
    res.end();

    logger.info(`DELETE /Account/:id - ${req.params.id}`);
  } catch (err) {
    res.status(400).send({ error: err.message });
    logger.error(`DELETE /Account - ${err.message}`);
  }
});

router.put('/', async (req, res) => {
  try {
    let newAccount = req.body;
    let data = await readFile(global.fileName, 'utf8');

    let json = JSON.parse(data);
    let oldIndex = json.accounts.findIndex(
      (account) => account.id === newAccount.id
    );
    json.accounts[oldIndex].name = newAccount.name;
    json.accounts[oldIndex].balance = newAccount.balance;
    await writeFile(global.fileName, JSON.stringify(json));
    res.end();
    logger.info(`PUT /Account - ${JSON.stringify(newAccount)}`);
  } catch (err) {
    res.status(400).send({ error: err.message });
    logger.error(`PUT /Account - ${err.message}`);
  }
});

router.post('/transaction', async (req, res) => {
  try {
    let params = req.body;
    let data = await readFile(global.fileName, 'utf8');

    let json = JSON.parse(data);
    let index = json.accounts.findIndex((account) => account.id === params.id);
    // prettier-ignore
    if ((params.value < 0) && ((json.accounts[index].balance + params.value) < 0)) {
      throw new Error('Não ha valor suficiente');
    }
    json.accounts[index].balance += params.value;

    await writeFile(global.fileName, JSON.stringify(json));
    res.send(json.accounts[index]);

    logger.info(`PUT /Account - ${JSON.stringify(params)}`);
  } catch (err) {
    res.status(400).send({ error: err.message });
    logger.error(`POST /Account/transaction - ${err.message}`);
  }
});
export default router;
