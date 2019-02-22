const path = require("path");
const express = require("express");
const line = require("@line/bot-sdk");

const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
};
const lineClient = new line.Client(lineConfig);


//////////////////↓ここを修正/////////////////////////
function createReplyMessage(input) {
  const homerulang = ["凄いぞ！", "さすが！","よくやった！","いいね！","かっこいいぞ！","大丈夫だよ！","Good!!!","very good!","Nice!","Great!","Excellent!",
"Wonderful!","Amazing!","Fantastic!","Perfect!","Cool!","Good job!","You’ve got the gift."];
  let text; // 返信メッセージを入れる変数
  const homeru = ["褒めて！", "褒めてー！","ほめて！", "ほめてー！","褒めて","ほめて","褒めてー","ほめてー"];
  if (homeru.indexOf(input) === -1) {
    text = "褒めて！（褒めてー！、ほめて！、ほめてー！、褒めて、ほめて）って言ってみてね！君を褒めるよ！";
  } else {
    text = homerulang[Math.floor(homerulang.length * Math.random())];
  }

  return {
    type: "text",
    // 「text: text」のようにキー名と変数名が同じ場合、以下のように省略可能
    // Object Shorthandという文法です
    text
  };
}
//////////////////↑ここを修正/////////////////////////

//ここより下は変更しない
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
