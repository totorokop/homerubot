const path = require("path");
const express = require("express");
const line = require("@line/bot-sdk");

const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
};
const lineClient = new line.Client(lineConfig);

function createReplyMessage(input) {
  // 3. 条件分岐（じゃんけん）
  const hands = ["グー", "チョキ", "パー"];
  // 返信メッセージを入れる変数
  let text;

  // 配列.indexOf(引数) =>
  //   引数が配列の何番目（0始まり）にあるかを返す
  //   引数が配列にない場合、-1を返す
  if (hands.indexOf(input) === -1) {
    // ユーザーが入力した内容が「グー、チョキ、パー」以外だった場合
    text = "グー・チョキ・パーのどれかを入力してね";
  } else {
    // 手からランダムに一つ選択
    text = hands[Math.floor(hands.length * Math.random())];
  }

  return {
    type: "text",
    // 「text: text」のようにキー名と変数名が同じ場合、以下のように省略可能
    // Object Shorthandという文法です
    text
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
