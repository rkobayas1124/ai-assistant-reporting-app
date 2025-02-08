const mysql = require("mysql2/promise");

function makeDBPool(dbInfo){
    // データベース接続設定
    const db = mysql.createPool({
      host: dbInfo.host,
      user: dbInfo.user,
      password: dbInfo.password,
      database: dbInfo.database,
      port: dbInfo.port
    });

    console.log("makeDBPool");
    return db;
}

async function getMySQLMetaData(dbInfo){
    const db = makeDBPool(dbInfo);
    if(db == null) throw new Error('dbPool is null!');

    const tableQuery ='SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = "mijs" ORDER BY TABLE_NAME, ORDINAL_POSITION;'

    try {
        //console.log(db);
        const [rows] = await db.execute(tableQuery);
        return JSON.stringify(rows);
    } catch (err) {
        throw new Error('getMetaData is failed!');
    }

}

async function runMySQL(sql,dbInfo){
    const db = makeDBPool(dbInfo);
    if(db == null) throw new Error('dbPool is null!');
    if(sql == null) throw new Error('sql is required!');
    try {
        const [rows] = await db.execute(sql);
        return JSON.stringify(rows);
    } catch (err) {
        throw new Error('runSQL is failed!');
    }
}

module.exports = {
    getMySQLMetaData,
    runMySQL
};
