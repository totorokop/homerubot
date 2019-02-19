const path = require("path");
const express = require("express");
const line = require("@line/bot-sdk");

const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
};
const lineClient = new line.Client(lineConfig);

function createReplyMessage(input) {
  // 2. オウム返しする
  return {
    type: "text",
    // `（バッククォート）で囲った中で${変数名}や${式}を書くと結果が展開される
    // テンプレートリテラル（Template literal）という文法です
    text: `${input}、と言いましたね？`
    // 以下と同じです
    // text: input + '、と言いましたね？'
  };
}

const server = express();

server.use("/images", express.static(path.join(__dirname, "images")));

server.post("/webhook", line.middleware(lineConfig), (req, res) => {
  // LINEのサーバーに200を返す
  res.sendStatus(200);

  for (const event of req.body.events) {
    if (event.type === "message" && event.message.type === "text") {
      const message = createReplyMessage(event.message.text);
      lineClient.replyMessage(event.replyToken, message);
    }
  }
});

server.listen(process.env.PORT || 8080);
