const {Pool} = require('pg');

function makeDBPool(dbInfo){
    try{
        // データベース接続設定
        const db = new Pool({
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

async function getPostgreSQLMetaData(dbInfo){
    const db = makeDBPool(dbInfo);
    if(db == null) throw new Error('dbPool is null!');

    const tableQuery ='SELECT TABLE_NAME,COLUMN_NAME,DATA_TYPE,IS_NULLABLE,character_maximum_length FROM INFORMATION_SCHEMA.COLUMNS WHERE table_schema = \'public\' and table_catalog = \'mijs\' ORDER BY TABLE_NAME, ORDINAL_POSITION;'

    const client = await db.connect();
    try {
        //console.log(db);
        const res = await client.query(tableQuery);
        return JSON.stringify(res.rows);
    } catch (err) {
        console.log(err.message);
        throw new Error('getMetaData is failed!');
    } finally{
        client.release();
    }
}

async function runPostgreSQL(sql,dbInfo){
    const db = makeDBPool(dbInfo);
    if(db == null) throw new Error('dbPool is null!');
    if(sql == null) throw new Error('sql is required!');

    const client = await db.connect();
    try {
        const res = await client.query(sql);
        return JSON.stringify(res.rows);
    } catch (err) {
        console.log(err.message);
        throw new Error('runSQL is failed!');
    }finally{
        client.release();
    }
}

module.exports = {
    getPostgreSQLMetaData,
    runPostgreSQL
};
