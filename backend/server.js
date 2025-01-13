require("dotenv").config(); // dotenvを読み込む
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const { OpenAI } = require("openai");
const { createPrompt } = require("./prompt");

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

// データベース接続設定
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT
});

app.post("/runQuery", async (req, res) => {
  const { query } = req.body;
  console.log("query:"+query);
  try {
    const [rows] = await db.execute(query);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

const tableQuery ='SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = "mijsdb" ORDER BY TABLE_NAME, ORDINAL_POSITION;'

app.post("/tableInfo", async (req, res) => {
    try {
      const [rows] = await db.execute(tableQuery);
      res.json({ success: true, data: rows });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

// OpenAI APIの設定
const openai = new OpenAI({
  organization: process.env.OPENAI_ORGANIZATION,
  project: process.env.OPENAI_PROJECT,
  apiKey: process.env.OPENAI_API_KEY
});

// OpenAIへメッセージを投げるエンドポイント
app.post("/openai", async (req, res) => {
  const { message,table } = req.body;

  if (!message || !table) {
    return res.status(400).json({ success: false, error: "Message is required" });
  }

  try {
    const prompt = createPrompt(message, table);
    console.log("prompt:"+prompt);
    // GPTへのリクエスト
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // 使いたいGPTのモデルを選択
      messages: [
        { role: "user", content: prompt } // ユーザーからのメッセージ
      ],
    });

    const reply = completion.choices[0].message.content;
    console.log("reply:"+reply);
    res.json({ success: true, data: reply }); // GPTの回答を返す
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// アシスタントを作るエンドポイント
app.post("/createAssistant", async (req, res) => {
  const { table } = req.body;

  if (!table) {
    return res.status(400).json({ success: false, error: "Message is required" });
  }

  try {
    const prompt = 
    `あなたはSQLに詳しいエンジニアです。`+
    `次のような情報で作成されたテーブルが存在するMySQLのデータベースがあります。`+
    `「`+table+`」。`+
    `このデータベースに対して、これから送られる要求を満たすSQLクエリをMySQLの構文に従って作成してください。`+
    `返信はそのSQLクエリの文章のみで、ほかの文字が入らないようにしてください(例: SELECT * FROM sample;)。`;

    // アシスタントの作成
    const assistant = await openai.beta.assistants.create({
      name: "SQL generator",
      description: "SQL generator",
      model: "gpt-4o-mini", // 使いたいGPTのモデルを選択
      instructions: prompt,
    });
    console.log("assistant id:"+assistant.id);
    res.json({ success: true, data: assistant.id }); // assistantのIDを返す
  } catch (error) {
    console.error("Error create assistant:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// スレッドを作るエンドポイント
app.post("/createThread", async (req, res) => {
  try {
    // スレッドの作成
    const thread = await openai.beta.threads.create();
    console.log("thread id:"+thread.id);
    res.json({ success: true, data: thread.id }); // assistantのIDを返す
  } catch (error) {
    console.error("Error create thread:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// スレッドにメッセージを追加し、実行するエンドポイント
app.post("/runThread", async (req, res) => {
  const { message, assistantId, threadId } = req.body;

  if (!message || !assistantId || !threadId) {
    return res.status(400).json({ success: false, error: "Message is required" });
  }

  try {
    //threadIdのスレッドにメッセージを追加
    const create = await openai.beta.threads.messages.create(
      threadId,
      { role: "user", content:message }
    );

    // スレッドをアシスタントで実行
    const run = await openai.beta.threads.runs.createAndPoll(
      threadId,
      {assistant_id: assistantId},
    );

    if(run.status === "completed"){
      const replys = await openai.beta.threads.messages.list(threadId);
      
      console.log("replys:", replys.data[0].content);

      res.json({ success: true, data:  replys.data[0].content[0].text.value }); // GPTの回答を返す
    }else{
      res.json({ success: true, data: "I'm thinking..." }); // GPTの回答を返す
    }

  } catch (error) {
    console.error("Error run thread:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
