const fs = require("fs");
const express = require("express");

const port = process.env.PORT || 4000;

const app = express();

app.get("/", respondText);
app.get("/json", respondJson);
app.get("/echo", respondEcho);
app.get("/static/*", respondStatic);

app.listen(port, () => console.log(`Server started on port ${port}`));

function respondText(req, res) {
  res.setHeader("Content-Type", "text/plain");
  res.end("hi");
}

function respondJson(req, res) {
  res.json({ email: "vadim@vadim.com", name: "Vadim" });
}

function repondNotFound(req, res) {
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
