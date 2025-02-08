const express = require("express");
const cors = require("cors");
const {getDbInformation} = require('./dbInformation');
const {getMySQLMetaData, runMySQL} = require('./mysqlAccess');
const {createThread, runThread} = require('./aiAssistant');

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

app.post("/makeThread", async (req, res) => {
  try{
    console.log("/makeThread");
    const threadID = await createThread();
    console.log("threadID");
    console.log(threadID);
    const { resource } = req.body;
    const dbInfo = getDbInformation(resource);
    console.log("dbInfo");
    console.log(dbInfo);
    switch(dbInfo.type){
      case 'MySQL':
        const metaData = await getMySQLMetaData(dbInfo);
        console.log("MetaData");
        console.log(metaData);
        const insertedInfo = await runThread('DataBase: DataBaseType is MySQL. context is '+metaData, threadID);
        res.json({success:true, threadId:threadID, insertedInfo: insertedInfo});
        break;
      default:
        res.status(500).json({ success: false, error: 'dbType is not correct!' });
        break;
    }
  }catch(error){
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/textToSQL", async (req, res) => {
  try{
    const { questionText, threadId } = req.body;
    const sql = await runThread('SQL:'+questionText,threadId);
    console.log(sql);
    res.json({ success:true, sql:sql});
  }catch(error){
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/answer", async (req, res) => {
  try{
    const { sql, threadId, resource } = req.body;
    console.log("sql");
    console.log(sql);
    const dbInfo = getDbInformation(resource);
    switch(dbInfo.type){
      case 'MySQL':
        const result = await runMySQL(sql,dbInfo);
        console.log("result");
        console.log(result);
        const answer = await runThread('Answer:'+result, threadId);
        console.log(answer);
        res.json({ success:true, result:result, answer:answer});
        break;
      default:
        res.status(500).json({ success: false, error: 'dbType is not correct!' });
        break;
    }
  }catch(error){
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/normalQuestion", async (req, res) => {
  try{
    const { questionText, threadId } = req.body;
    console.log("question");
    console.log(questionText);
    const answer = await runThread('Normal:'+questionText, threadId);
    console.log(answer);
    res.json({ success:true, answer:answer});
  }catch(error){
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
