const path = require("path");
const express = require("express");
const line = require("@line/bot-sdk");
const axios = require("axios");

const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
};
const lineClient = new line.Client(lineConfig);

async function createReplyMessage(input) {
  // Yahoo! 郵便番号検索API
  // https://developer.yahoo.co.jp/webapi/map/openlocalplatform/v1/zipcodesearch.html#response_field
  const params = {
    appid: process.env.YJDN_CLIENT_ID,
    query: input,
    output: "json",
    results: 1
  };
  const { data } = await axios.get(
    "https://map.yahooapis.jp/search/zip/V1/zipCodeSearch",
    { params }
  );

  if (data.ResultInfo.Count === 0) {
    return {
      type: "text",
      text: `「${input}」の検索結果は0件でした。`
    };
  }

  const feature = data.Feature[0];
  const property = feature.Property;
  const address = property.Address;
  const station = property.Station && property.Station[0];
  const stationName = station ? `${station.Railway} ${station.Name}` : "なし";

  return {
    type: "text",
    text: `住所は「${address}」、最寄り駅は「${stationName}」です。`
  };
}

const server = express();

server.use("/images", express.static(path.join(__dirname, "images")));

server.post("/webhook", line.middleware(lineConfig), async (req, res) => {
  // LINEのサーバーに200を返す
  res.sendStatus(200);

  for (const event of req.body.events) {
    if (event.type === "message" && event.message.type === "text") {
      try {
        const message = await createReplyMessage(event.message.text);
        lineClient.replyMessage(event.replyToken, message);
      } catch (err) {
        console.log("エラー発生！", err.message, err.stack);
        console.log(err.message);
        console.log(err.stack);
      }
    }
  }
});

server.listen(process.env.PORT || 8080);
