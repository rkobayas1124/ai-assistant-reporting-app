import { useState, useEffect } from "react";
import { json, ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { runQuery } from "../utils/runQuery"; // SQLクエリを実行するAPI関数
import { getTableInfo } from "../utils/tableInfo"; // テーブル情報を取得するAPI関数

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  try {
    const tableInfo = await getTableInfo(); // getTableInfo を呼び出し
    //console.log("tableInfo : "+tableInfo);
    return json({ tableInfo }); // 結果を返す
  } catch (error : unknown) {
    if (error instanceof Error) {
      //console.log("error : "+error.message);
      return json({ error: error.message }, { status: 500 }); // エラー時のレスポンス
    }else{
      //console.log("error : unknown");
      return json({ error: "An unknown error occurred." }, { status: 500 }); // エラー時のレスポンス
    }
  }
};

// `messages`と`error`の型を明示
type Message = {
  text: string;
  fromUser: boolean;
};

export default function ChatApp() {
  const [query, setQuery] = useState<string>(""); // ユーザーの入力メッセージ
  const [messages, setMessages] = useState<Message[]>([]); // メッセージ履歴
  const [error, setError] = useState<string | null>(null); // エラーメッセージ
  const [tableInfo, setTableInfo] = useState<string | null>(null);

  const table = useLoaderData(); // loaderから返されたデータを取得
  // データ取得後にstateを更新する
  useEffect(() => {
    if (table) {
      setTableInfo(JSON.stringify(table));

      const tableMessage: Message = { text: 'table Information', fromUser: true };
      const tableInfoMessage: Message = { text: JSON.stringify(table), fromUser: false };
      setMessages([...messages, tableMessage, tableInfoMessage]);
    }
  }, [table]); // tableが変化するたびに実行

  // メッセージ送信のハンドラ
  const handleSend = async () => {
    if (!query.trim()) return; // 空のメッセージを送信しない

    const newMessage: Message = { text: query, fromUser: true };
    setMessages([...messages, newMessage]); // ユーザーのメッセージを追加

    try {
      // SQLクエリをAPIに送信
      const data = await runQuery(query);
      const botMessage: Message = { text: JSON.stringify(data, null, 2), fromUser: false };
      setMessages([...messages, newMessage, botMessage]); // ユーザーとボットのメッセージを追加
      setError(null);
    } catch (err: unknown) {
      // `err`の型が`unknown`であるため、型ガードを使用して安全にアクセス
      if (err instanceof Error) {
        setError(err.message); // エラーメッセージを設定
        const botMessage: Message = { text: `Error: ${err.message}`, fromUser: false };
        setMessages([...messages, newMessage, botMessage]); // ユーザーとエラーメッセージを表示
      } else {
        setError("An unknown error occurred.");
      }
    }

    setQuery(""); // 入力欄を空にする
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <h1>Chat App</h1>

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "10px",
          maxHeight: "400px",
          overflowY: "auto",
          marginBottom: "20px",
        }}
      >
        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              textAlign: message.fromUser ? "right" : "left",
              margin: "10px 0",
            }}
          >
            <p
              style={{
                display: "inline-block",
                padding: "10px",
                borderRadius: "10px",
                backgroundColor: message.fromUser ? "#a5d6a7" : "#e1f5fe",
                maxWidth: "80%",
              }}
            >
              {message.text}
            </p>
          </div>
        ))}
      </div>

      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      <textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        rows={3}
        cols={50}
        placeholder="Enter your message here..."
        style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ddd" }}
      />
      <button
        onClick={handleSend}
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "5px",
          backgroundColor: "#4caf50",
          color: "white",
          border: "none",
          cursor: "pointer",
          marginTop: "10px",
        }}
      >
        Send
      </button>
    </div>
  );
}
