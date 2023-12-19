const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const gTTS = require("gtts");
const sound = require("sound-play");
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
// const gtts = new gTTS(speech, "en");
const GenAiSchema = {
  question: String,
  response: String,
};
app.use(express.static("public"));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb://localhost:27017/wikiDB");

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

async function run(data) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const prompt = data;
  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  console.log("your request is " + data);
  console.log("\t\n");
  console.log(text);
  return text;
}

app.get("/data", async (req, res) => {
  let data = await run("some idea about ram mandir in india");
  res.send(data);
});

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "/index.html"));
});

app.post("/api", async function (req, res, next) {
  console.log(req.body.input);
  const mes = await run(req.body.input);
  const gtts = new gTTS(mes, "en");
  gtts.save("file.mp3", function (err, result) {
    if (err) {
      throw new Error(err);
    }
    console.log("Text to speech converted!");
  });
  res.json({ success: true, message: mes });
});


app.listen(3000, function () {
  console.log("server started on port 3000");
});
