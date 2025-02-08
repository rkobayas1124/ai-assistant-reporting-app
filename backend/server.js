const express = require("express");
const cors = require("cors");
const {makeDBPool, getMetaData, runSQL} = require('./dbAccess');
const {createThread, runThread} = require('./aiAssistant');

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

app.post("/makeThread", async (req, res) => {
  try{
   console.log("/makeThread")
    const { resource } = req.body;
    const db=makeDBPool(resource);
    const metaData = await getMetaData(db);
    console.log("MetaData");
    console.log(metaData);
    const threadID = await createThread();
    console.log("threadID");
    console.log(threadID);
    const insertedInfo = await runThread('DataBase:'+metaData, threadID);
    res.json({success:true, threadId:threadID, insertedInfo: insertedInfo});
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
    const db = makeDBPool(resource);
    const result = await runSQL(sql,db);
    console.log("result");
    console.log(result);
    const answer = await runThread('Answer:'+result, threadId);
    console.log(answer);
    res.json({ success:true, result:result, answer:answer});
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
