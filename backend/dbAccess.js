const mysql = require("mysql2/promise");
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

function getDBInformation(resource){
    console.log("resource:"+resource);
    // resourceに基づいて適切な設定を取得
    const dbInfo = config.development.find(db => db.name === resource);
    if (!dbInfo) {
        console.log("Database configuration not found");
      throw new Error("Database configuration not found");
    }
    return dbInfo
}

function makeDBPool(resource){
    const dbInfo = getDBInformation(resource);
    console.log(dbInfo);
    //const {name,host,user,password,database,port} = dbInfo;
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

async function getMetaData(db){
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

async function runSQL(sql,db){
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
    makeDBPool,
    getMetaData,
    runSQL
};
