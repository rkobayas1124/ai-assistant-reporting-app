const mssql = require("mssql");

function makeDBPool(dbInfo){
    try{
        // データベース接続設定
        const config = {
            server: dbInfo.host,
            user: dbInfo.user,
            password: dbInfo.password,
            database: dbInfo.database,
            port: parseInt(dbInfo.port,10),
            options: {
                trustServerCertificate: true // 自己署名証明書を信頼する
            }
        };

        return config;
    }catch(err){
        console.log(err.message);
        throw new Error('makeDBPool is failed!');
    }
}

async function getMSSQLMetaData(dbInfo){
    const db = makeDBPool(dbInfo);
    try {
        const conn = await mssql.connect(db);
        if(conn == null) throw new Error('dbPool is null!');

        const tableQuery ='SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_CATALOG = \'mijs\';';

        //console.log(db);
        const rows = await conn.query(tableQuery);
        return JSON.stringify(rows);
    } catch (err) {
        console.log(err.message);
        throw new Error('getMetaData is failed!');
    } finally{
        mssql.close();
    }
}

async function runMSSQL(sql,dbInfo){
    const db = makeDBPool(dbInfo);
    if(db == null) throw new Error('dbPool is null!');
    if(sql == null) throw new Error('sql is required!');
    try {
        const conn = await mssql.connect(db);
        const rows = await conn.query(sql);
        return JSON.stringify(rows);
    } catch (err) {
        console.log(err.message);
        throw new Error('runSQL is failed!');
    } finally{
        mssql.close();
    }
}

module.exports = {
    getMSSQLMetaData,
    runMSSQL
};
