import express from 'express';
import { AConnectionPool, IConnectionOptions, ATransaction, Factory } from 'gdmn-db';

const app = express();

const contacts: string[] = [];

const connect = async () => {
  const driver = Factory.FBDriver;
  const dbOptions: IConnectionOptions = {
    server: { host: 'localhost', port: 3050 },
    path: 'test',
    username: 'SYSDBA',
    password: 'masterkey'
  };

  await AConnectionPool.executeConnectionPool({
    connectionPool: driver.newCommonConnectionPool(),
    connectionOptions: dbOptions,
    options: { min: 1, max: 1 },
    callback: async connectionPool => {
      const con = await connectionPool.get();
      const transaction: ATransaction = await con.startTransaction();
      try {
        const sqlParams = await con.prepare(transaction, `select name from gd_contact where name > '' and id = :id and name = :name and contacttype = :ct`);
        console.log(sqlParams);

/*         const resultSet = await con.executeQuery(
          transaction,
          `select name from gd_contact where name > ''`
        );
        contacts.splice(0, contacts.length);
        while (await resultSet.next()) {
          contacts.push(resultSet.getString('NAME'));
        }
        console.log('saved!');
        await resultSet.close(); */
      } catch (e) {
        console.log(e);
      }
      await transaction.rollback();
      await con.disconnect();
    }
  });
};

app.get('/', async (req, res) => {
  try {
    await connect();
  } catch (err) {
    console.log(err);
  } finally {
    let result = '<h1>Hello World!</h1>';
    result += contacts.reduce((itm, acc) => (acc += `<div>${itm}</div>`)).split(' ');
    res.send(result);
  }
});

app.listen(3000, () => console.log('Example app listening on port 3000!'));
