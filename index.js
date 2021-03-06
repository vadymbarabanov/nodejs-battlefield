const fs = require("fs");
const EventEmitter = require("events");
const express = require("express");
const chatEmitter = new EventEmitter();

chatEmitter.on("message", console.log);

const port = process.env.PORT || 4000;

const app = express();

app.get("/", respondText);
app.get("/json", respondJson);
app.get("/echo", respondEcho);
app.get("/static/*", respondStatic);

app.get("/chat", respondChat);
app.get("/sse", respondSSE);

app.listen(port, () => console.log(`Server started on port ${port}`));

function respondSSE(req, res) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
  });

  fs.readFile(
    `${__dirname}/log/chatLog.txt`,
    { encoding: "utf8" },
    (err, data) => {
      if (err) {
        console.log(err);
        return;
      }
      let buff = data.split("\n");

      // omit last item in array because it's empty string
      for (let i = 0; i < buff.length; i++) {
        res.write(`data: ${buff[i]}\n\n`);
      }
    }
  );

  const onMessage = (msg) => res.write(`data: ${msg}\n\n`);

  chatEmitter.on("message", onMessage);
  res.on("close", () => {
    chatEmitter.off("message", onMessage);
  });
}

function respondChat(req, res) {
  const { message } = req.query;

  if (message) {
    fs.appendFile(`${__dirname}/log/chatLog.txt`, message + "\n", (err) => {
      if (err) {
        console.log(err);
      }
    });
    chatEmitter.emit("message", message);
  }
  res.end();
}

function respondText(req, res) {
  res.setHeader("Content-Type", "text/plain");
  res.end("hi");
}

function respondJson(req, res) {
  res.json({ email: "vadim@vadim.com", name: "Vadim" });
}

function respondNotFound(req, res) {
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not Found");
}

function respondEcho(req, res) {
  const { input = "" } = req.query;

  res.json({
    normal: input,
    shouty: input.toUpperCase(),
    characterCount: input.length,
    backwards: input.split("").reverse().join(""),
  });
}

function respondStatic(req, res) {
  const filename = `${__dirname}/public/${req.params[0]}`;
  fs.createReadStream(filename)
    .on("error", () => respondNotFound(req, res))
    .pipe(res);
}
