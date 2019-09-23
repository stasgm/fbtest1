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
  const sql = `select * from gd_contact where id = :id and contacttype = :contype`
  const sqlPrepare = await con.prepare(transaction, sql);

  const sqlPlan = await sqlPrepare.getPlan();
  console.log(sqlPlan);

  const paramList = [];
  for(let i = 0; i < sqlPrepare.inMetadata.columnCount; i += 1){
    paramList.push(`параметр ${i + 1} - ${sqlPrepare.inMetadata.getColumnLabel(i)}`);
  };

  console.log("Params:\n" + paramList.reduce((itm, acc) => (acc += `, ${itm}`)).split('\n'));

  const fieldList = [];
  for(let i = 0; i < sqlPrepare.outMetadata.columnCount; i += 1){
    fieldList.push(`выходные даные ${i + 1} - ${sqlPrepare.outMetadata.getColumnLabel(i)}`);
  };

  console.log("Fields:\n" + fieldList.reduce((itm, acc) => (acc += `, ${itm}`)).split('\n'));

  await sqlPrepare.dispose();

  const params = {id: 147424690, contype: 4 };
  const resultSet = await con.executeQuery(transaction, sql, params);

  const contacts: string[] = [];

  while (await resultSet.next()) {
    contacts.push(resultSet.getString('NAME'));
  }

  console.log("Contacts:\n" + contacts.reduce((itm, acc) => (acc += `, ${itm}`), '').split('\n'));

  await resultSet.close();
  await transaction.rollback();
  await con.disconnect();
};

connect().catch(err => console.log(err));
