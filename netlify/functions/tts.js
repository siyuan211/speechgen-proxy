exports.handler = async function(event) {
  const text = event.queryStringParameters.text;
  if (!text) {
    return {
      statusCode: 400,
      body: "缺少 text 参数"
    };
  }
  const home = await fetch(
    "https://speechgen.io/zh/tts-japanese/"
  );
  const cookie = home.headers.get("set-cookie");
  const params = new URLSearchParams();
  params.append(
    "param",
    JSON.stringify({
      lang: "ja-JP",
      voice: "Asuka",
      style: "",
      speed: 1,
      pitch: 0,
      volume: 100,
      styledegree: 1,
      role: "",
      format: "mp3",
      pp: "400",
      ps: "300",
      hz: "48000",
      speed_type: 1,
      bitrate: 64,
      channels: 1,
      text: text,
      captcha_value: "123456",
      vocabulary: false,
      popup_cptch: 0
    })
  );
  const response = await fetch(
    "https://speechgen.io/index.php?r=tts/TextToMp3Add&lang=zh",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Cookie": "PHPSESSID=jud0pq1c951ehjth5l7fojisbf",
        "Origin": "https://speechgen.io",
        "Referer": "https://speechgen.io/zh/tts-japanese/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        "Accept": "*/*"
      },
      body: params
    }
  );
  const data = await response.json();
  if (!data.prj_id) {
    return {
      statusCode: 500,
      body: JSON.stringify(data)
    };
  }
  // 等待语音生成
  await new Promise(resolve => setTimeout(resolve, 3000));
  const player = await fetch(
    "https://speechgen.io/index.php?r=site/LoadPlayer&id=" 
    + data.prj_id 
    + "&lang=zh",
    {
      headers: {
        "Cookie": "PHPSESSID=jud0pq1c951ehjth5l7fojisbf",
        "User-Agent": "Mozilla/5.0"
      }
    }
  );
  const html = await
  player.text();
  const match = html.match(
    /data-track="([^"]+\.mp3)"/
  );
  if (!match) {
    return {
      statusCode: 500,
      body: html
    };
  }
  const mp3Url = "https://speechgen.io" + match[1];
  const mp3 = await fetch(mp3Url, {
    headers: {
      "Cookie": "PHPSESSID=jud0pq1c951ehjth5l7fojisbf",
      "User-Agent": "Mozilla/5.0"
    }
  });
  const buffer = await mp3.arrayBuffer();
  return {
  statusCode: 200,
  headers: {
    "Content-Type": "audio/mpeg",
    "Content-Disposition": "inline"
  },
  body: Buffer.from(buffer).toString("base64"),
  isBase64Encoded: true
};
};