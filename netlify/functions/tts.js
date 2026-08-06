exports.handler = async function(event) {
  const text = event.queryStringParameters.text;
  if (!text) {
    return {
      statusCode: 400,
      body: "缺少 text 参数"
    };
  }
  // 第一步：请求 FreeTTS 生成语音
  const create = await fetch(
    "https://freetts.org/api/tts",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: text,
        voice: "ja-JP-NanamiNeural",
        rate: "+0%",
        pitch: "+0Hz"
      })
    }
  );
  const result = await create.json();
  if (!result.file_id) {
    return {
      statusCode: 500,
      body: JSON.stringify(result)
    };
  }
  // 第二步：获取 MP3
  const audio = await fetch(
    "https://freetts.org/api/audio/" + result.file_id
  );
  const buffer = await audio.arrayBuffer();
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "audio/mpeg"
    },
    body: Buffer.from(buffer).toString("base64"),
    isBase64Encoded: true
  };
};