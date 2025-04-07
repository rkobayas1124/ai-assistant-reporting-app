const fs = require('fs');

const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

function getDbInformation(resource){
    console.log("resource:"+resource);
    // resourceに基づいて適切な設定を取得
    const dbInfo = config.development.find(db => db.name === resource);
    if (!dbInfo) {
        console.log("Database configuration not found");
      throw new Error("Database configuration not found");
    }
    return dbInfo
}

module.exports = {
    getDbInformation
};