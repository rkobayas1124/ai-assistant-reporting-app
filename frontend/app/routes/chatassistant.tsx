import { useState} from "react";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

let resource:string|null="mysql";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const url = new URL(request.url);
    resource = url.searchParams.get('resource');

    console.log("makeThread");

    const response = await fetch("http://localhost:4000/makeThread", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({resource}),
    });
    const data = await response.json();
    
    if(response.ok){
      const threadId = data.threadId;
      const firstResponse = data.insertedInfo;
      console.log("makeThread OK!");
      return json( {threadId, firstResponse}); // 結果を返す
    }else{
      console.log("makeThread failed!");
      return json({ error: data.error}, { status: 500 }); // エラー時のレスポンス
    }

  } catch (error : unknown) {
    if (error instanceof Error) {
      return json({ error: error.message }, { status: 500 }); // エラー時のレスポンス
    }else{
      return json({ error: "An unknown error occurred." }, { status: 500 }); // エラー時のレスポンス
    }
  }
};

// `messages`と`error`の型を明示
type Message = {
  text: string;
  fromUser: boolean;
  type: number;//0:from User 1:from ai (sql) 2:from ai (message) 3:from db
  isError : boolean;
};

export default function ChatApp() {
  const loaderData = useLoaderData<{ threadId: string; firstResponse: string }>(); // loaderから返されたデータを取得
  const threadId = loaderData.threadId;
  const firstResponse = loaderData.firstResponse;
  const firstMessage: Message = { text: firstResponse, fromUser: true ,type: 2, isError:false};

  const [userMessage, setUserMessage] = useState<string>(""); // ユーザーの入力メッセージ
  const [messages, setMessages] = useState<Message[]>([firstMessage]); // メッセージ履歴
  const [error, setError] = useState<string | null>(null); // エラーメッセージ TODO:loaderでのエラーもここに
  const [status, setStatus]= useState<string>("");

  // SQL生成のハンドラ
  const createSQL = async () => {
    setStatus("running...");

    const newMessage: Message = { text: userMessage, fromUser: true ,type: 0, isError:false};
    setMessages([...messages, newMessage]); // ユーザーのメッセージを追加
    try {
        //const sql = await runThread(userMessage); // SQLクエリを作成
        const questionText = userMessage;
        const response = await fetch("http://localhost:4000/textToSQL", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ questionText,threadId }),
        });
        const data = await response.json();
        if(!response.ok){
          throw new Error(data.error || "Failed to text to sql.");
        }
        const sql = data.sql;
        console.log("sql : "+sql);
        const queryStr:string = sql.replace(/^"(.*)"$/, "$1"); // 先頭と末尾の `"` を削除;
        const queryMessage: Message = { text: queryStr, fromUser: false, type:1, isError:false};
        setMessages([...messages, newMessage, queryMessage]); // 作成したクエリを追加
        setError(null);

        setUserMessage(""); // 入力欄を空にする
    } catch (err: unknown) {
        // `err`の型が`unknown`であるため、型ガードを使用して安全にアクセス
        if (err instanceof Error) {
            setError(err.message); // エラーメッセージを設定
            const queryMessage: Message = { text: `Error: ${err.message}`, fromUser: false ,type:1, isError:true};
            setMessages([...messages, queryMessage]); // ユーザーとエラーメッセージを表示
        } else {
            setError("An unknown error occurred.");
        }
    }finally{
      setStatus("");
    }
  };

  // SQL実行のハンドラ
  const runSQL = async () => {
    setStatus("running...");

    try {
        //sqlを検索
        let sql="";
        for (let i = messages.length - 1; i >= 0; i--) {
          if (messages[i].type==1 && !messages[i].isError) {
            sql=messages[i].text;
            break;
          }
        }
        if(sql==""){
          throw new Error("sql is not Found!");
        }
        const response = await fetch("http://localhost:4000/answer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sql, threadId, resource }),
        });
        const data = await response.json();
        if(!response.ok){
          throw new Error(data.error || "Failed to run sql.");
        }
        const result = data.result;
        console.log("result : "+result);
        const resultMessage: Message = { text: result, fromUser: false , type: 3, isError:false};
        //setMessages([...messages,  resultMessage]); // 作成したクエリを追加
        const answer = data.answer;
        console.log("answer : "+answer);
        const answerMessage: Message = { text: answer, fromUser: false , type: 2, isError:false};
        setMessages([...messages,  resultMessage, answerMessage]); // 作成したクエリを追加
        setError(null);

        setUserMessage(""); // 入力欄を空にする
    } catch (err: unknown) {
        // `err`の型が`unknown`であるため、型ガードを使用して安全にアクセス
        if (err instanceof Error) {
            setError(err.message); // エラーメッセージを設定
            const resultMessage: Message = { text: `Error: ${err.message}`, fromUser: false, type:3, isError:true };
            setMessages([...messages, resultMessage]); // ユーザーとエラーメッセージを表示
        } else {
            setError("An unknown error occurred.");
        }
    }finally{
      setStatus("");
    }
  };

  // 通常質問のハンドラ
  const normalQuestion = async () => {
    setStatus("running...");

    const newMessage: Message = { text: userMessage, fromUser: true ,type: 0, isError:false};
    setMessages([...messages, newMessage]); // ユーザーのメッセージを追加
    try {
        //const sql = await runThread(userMessage); // SQLクエリを作成
        const questionText = userMessage;
        const response = await fetch("http://localhost:4000/normalQuestion", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ questionText, threadId }),
        });
        const data = await response.json();
        if(!response.ok){
          throw new Error(data.error || "Failed to text to sql.");
        }
        const answer = data.answer;
        console.log("answer : "+answer);
        const answerMessage: Message = { text: answer, fromUser: false, type:2, isError:false};
        setMessages([...messages, newMessage, answerMessage]); // 作成したクエリを追加
        setError(null);

        setUserMessage(""); // 入力欄を空にする
    } catch (err: unknown) {
        // `err`の型が`unknown`であるため、型ガードを使用して安全にアクセス
        if (err instanceof Error) {
            setError(err.message); // エラーメッセージを設定
            const answerMessage: Message = { text: `Error: ${err.message}`, fromUser: false ,type:1, isError:true};
            setMessages([...messages, newMessage, answerMessage]); // ユーザーとエラーメッセージを表示
        } else {
            setError("An unknown error occurred.");
        }
    }finally{
      setStatus("");
    }
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "20px" }}>
      <h1>SQL Generator</h1>

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "10px",
          maxHeight: "600px",
          minHeight: "600px",
          overflowY: "auto",
          marginBottom: "20px",
        }}
      >
        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              textAlign: message.type==0 ? "right" : "left",
              margin: "10px 0",
            }}
          >
            <p
              style={{
                display: "inline-block",
                padding: "10px",
                borderRadius: "10px",
                backgroundColor: message.isError ? "#ff6347": message.type==0 ? "#f5f5f5" : message.type==2 ? "#a5d6a7":message.type==3 ? "#f0e68c":"#e1f5fe",
                //maxWidth: "80%",
              }}
            >
              <pre>{message.text}</pre>
            </p>
          </div>
        ))}
      </div>

      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      <textarea
        value={userMessage}
        onChange={(e) => setUserMessage(e.target.value)}
        rows={3}
        cols={50}
        placeholder="Enter your message here..."
        style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ddd" }}
      />
      <button
        onClick={createSQL}
        style={{
          width: "20%",
          padding: "10px",
          borderRadius: "5px",
          backgroundColor: "#4caf50",
          color: "white",
          border: "none",
          cursor: "pointer",
          marginTop: "10px",
        }}
      >
        Convert SQL
      </button>
      <button
        onClick={runSQL}
        style={{
          width: "20%",
          padding: "10px",
          borderRadius: "5px",
          backgroundColor: "#4caf50",
          color: "white",
          border: "none",
          cursor: "pointer",
          marginTop: "10px",
          marginLeft: "1%"
        }}
      >
        Run SQL
      </button>
      <button
        onClick={normalQuestion}
        style={{
          width: "20%",
          padding: "10px",
          borderRadius: "5px",
          backgroundColor: "#4caf50",
          color: "white",
          border: "none",
          cursor: "pointer",
          marginTop: "10px",
          marginLeft: "1%"
        }}
      >
        Question
      </button>
      <p>{status}</p>
    </div>
  );
}
