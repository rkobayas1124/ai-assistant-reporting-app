function createPrompt(message, table) {
    if (!message || !table) {
      throw new Error("Both message and table are required");
    }
    //return `Message: ${message}, Table: ${table}`;
    const prompt = 
        'mysqlにおいて、次の情報のように作られたテーブルがあります。'+
        '「'+table+'」。'+
        'このテーブルに関して、次の要求を満たすためのSQL文を作成してください。'+
        '「'+message+'」。'+
        '返信はSQL文のみで、「"」や「かっこ」は付けないでください。';
    return prompt;
  }
  
  module.exports = { createPrompt };