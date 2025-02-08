


export default function Test() {

  const testMakeThread = async () => {
    console.log("testMakeThread");
    const host='localhost';
    const user='dbadmin';
    const password='dbadmin';
    const database='mijs';
    const port='3306';
    try {
      const response = await fetch("http://localhost:4000/makeThread", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ host, user, password, database,port}),
      });

      const result = await response.json();

      console.log(result);
    
      return result;
    } catch (error) {
      if (error instanceof Error) {
            console.log("error : "+error.message);
            //return json({ error: error.message }, { status: 500 }); // エラー時のレスポンス
          }else{
            console.log("error : unknown");
            //return json({ error: "An unknown error occurred." }, { status: 500 }); // エラー時のレスポンス
          }
    }
 }

    const textToSQL = async () => {
        console.log("textToSQL");
        const questionText = 'データベース内にあるテーブルの名前を教えて下さい。'
        try {
          const response = await fetch("http://localhost:4000/textToSQL", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ questionText }),
          });
    
          const result = await response.json();
    
          console.log(result);
        
          return result;
        } catch (error) {
          if (error instanceof Error) {
                console.log("error : "+error.message);
                //return json({ error: error.message }, { status: 500 }); // エラー時のレスポンス
              }else{
                console.log("error : unknown");
                //return json({ error: "An unknown error occurred." }, { status: 500 }); // エラー時のレスポンス
              }
        }
    }

    const runSQL = async () => {
        console.log("runSQL");
        const sql = 'SHOW TABLES;'
        try {
          const response = await fetch("http://localhost:4000/answer", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ sql }),
          });
    
          const result = await response.json();
    
          console.log(result);
        
          return result;
        } catch (error) {
          if (error instanceof Error) {
                console.log("error : "+error.message);
                //return json({ error: error.message }, { status: 500 }); // エラー時のレスポンス
              }else{
                console.log("error : unknown");
                //return json({ error: "An unknown error occurred." }, { status: 500 }); // エラー時のレスポンス
              }
        }
    }
  

  return (
    <div>
      <button onClick={testMakeThread}>/makeThread</button>
      <button onClick={textToSQL}>/textToSQL</button>
      <button onClick={runSQL}>/runSQL</button>
    </div>
  );
}
