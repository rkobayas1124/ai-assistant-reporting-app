const mysql = require("mysql2/promise");

function makeDBPool(dbInfo){
    try{
        // データベース接続設定
        const db = mysql.createPool({
        host: dbInfo.host,
        user: dbInfo.user,
        password: dbInfo.password,
        database: dbInfo.database,
        port: dbInfo.port
        });

        return db;
    }catch(err){
        console.log(err.message);
        throw new Error('makeDBPool is failed!');
    }
}

async function getMySQLMetaData(dbInfo){
    const db = makeDBPool(dbInfo);
    if(db == null) throw new Error('dbPool is null!');

    const tableQuery ='SELECT TABLE_NAME,COLUMN_NAME,COLUMN_TYPE,IS_NULLABLE,CHARACTER_MAXIMUM_LENGTH FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = "mijs" ORDER BY TABLE_NAME, ORDINAL_POSITION;'

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
