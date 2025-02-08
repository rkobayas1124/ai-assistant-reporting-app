require("dotenv").config(); // dotenvを読み込む
const { OpenAI } = require("openai");

// OpenAI APIの設定
const openai = new OpenAI({
    organization: process.env.OPENAI_ORGANIZATION,
    project: process.env.OPENAI_PROJECT,
    apiKey: process.env.OPENAI_API_KEY
});

let assistantID=process.env.OPENAI_ASSISTANTID;
//let threadID=null;

async function createAssistant(metaData){
    if(metaData==null) throw new Error('metaData is null!');

    const prompt = 
    `あなたはSQLに詳しいエンジニアです。`+
    `次のような情報で作成されたテーブルやフィールドが存在するMySQLのデータベースがあります。`+
    `「`+metaData+`」。`+
    `これから送られる質問は「番号:内容」の形式です。番号の値に応じて次のように返してください。`+
    `[番号が0の場合]`+
    `質問内容に答えてください。`+
    `[番号が1の場合]`+
    `このデータベースに対して、質問内容の要求を満たすSQLクエリをMySQLの構文に従って作成してください。`+
    `返信はそのSQLクエリの文章のみで、ほかの文字が入らないようにしてください。(例: SELECT * FROM sample;)`+
    `[番号が2の場合]`+
    `直前の番号1の質問であなたが回答したSQL文を実際に実行した際の結果です。`+
    `この結果をもとに番号1の質問に対して文章やテーブル形式を使って答えてください。`;

    try{
    // アシスタントの作成
        const assistant = await openai.beta.assistants.create({
            name: "SQL generator",
            description: "SQL generator",
            model: "gpt-4o-mini", // 使いたいGPTのモデルを選択
            instructions: prompt,
        });
        assistantID = assistant.id;

        return assistant.id;
    }catch(error){
        throw new Error("createAssistant is failed!");
    }
}

async function createThread(){
    if(assistantID==null) throw new Error('assistantID is null!');

    try{
        const thread = await openai.beta.threads.create();

        return thread.id;
    }catch(error){
        throw new Error("createThread is failed!");
    }
}

async function runThread(message, threadId){
    console.log("runThread");
    if(assistantID==null) throw new Error('assistantID is null!');
    if(threadId==null) throw new Error('threadID is null!');
    console.log("threadId:"+threadId);

    if(message==null) throw new Error('message is required!');

    try {
        //threadIdのスレッドにメッセージを追加
        const create = await openai.beta.threads.messages.create(
            threadId,
            { role: "user", content:message }
        );
        console.log("create");
    
        // スレッドをアシスタントで実行
        console.log("assistantId:"+assistantID);
        const run = await openai.beta.threads.runs.createAndPoll(
          threadId,
          {assistant_id: assistantID},
        );
        console.log("run");
    
        if(run.status === "completed"){
          const replys = await openai.beta.threads.messages.list(threadId);
          console.log("reply:"+replys.data[0].content[0].text.value);
          return replys.data[0].content[0].text.value;// GPTの回答を返す
        }else{
            console.log("thinking");
          return "I'm thinking..."; // GPTの回答を返す
        }
    
      } catch (error) {
        console.log('error:'+error.message);
        throw new Error('runThread is failed!');
      }
}

module.exports = {
    createAssistant,
    createThread,
    runThread,
};

