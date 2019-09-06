import { IConnectionOptions, ATransaction, Factory } from 'gdmn-db';

const connect = async () => {
  const driver = Factory.FBDriver;
  const dbOptions: IConnectionOptions = {
    server: { host: 'localhost', port: 3050 },
    path: 'test',
    username: 'SYSDBA',
    password: 'masterkey'
  };

  const con = driver.newConnection();
  await con.connect(dbOptions);
  const transaction: ATransaction = await con.startTransaction();
  const sqlPrepare = await con.prepare(transaction, 'select name from gd_contact where id = :id and contacttype = :contype');

  const sqlPlan = await sqlPrepare.getPlan();
  console.log(sqlPlan);

  const paramList = [];
  for(let i = 0; i < sqlPrepare.metadata.columnCount; i += 1){
    paramList.push(`параметр ${i + 1} ${sqlPrepare.metadata.getColumnName(i).toString()}`);
  };

  console.log("Params:\n" + paramList.reduce((itm, acc) => (acc += `, ${itm}`)).split('\n'));

  await sqlPrepare.dispose();
  await transaction.rollback();
  await con.disconnect();
};

connect().catch(err => console.log(err));
