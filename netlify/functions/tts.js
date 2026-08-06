const fs = require("fs");
exports.handler = async function(event) {
  const { EdgeTTS } = await import("edge-tts");
  const text = event.queryStringParameters.text;
  if (!text) {
    return {
      statusCode: 400,
      body: "缺少 text"
    };
  }
  const tts = new EdgeTTS();
  await tts.synthesize(
    text,
    "ja-JP-NanamiNeural"
  );
  const audio = await tts.toFile(
    "/tmp/audio.mp3"
  );
  const buffer = fs.readFileSync("/tmp/audio.mp3");
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "audio/mpeg"
    },
    body: buffer.toString("base64"),
    isBase64Encoded: true
  };
};