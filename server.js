const express = require("express");
const https = require("https");
const fs = require("fs");
const cors = require("cors");
const helmet = require("helmet");
const PORT = 6060;

const app = express();
app.use(helmet());
app.use(
  cors({
    origin: "http://localhost:6000",
    optionsSuccessStatus: 200,
  })
);
const server = https.createServer(
  {
    key: fs.readFileSync("key.pem"),
    cert: fs.readFileSync("cert.pem"),
  },
  app
);

app.get("/secret", (req, res) => {
  return res.send("The secret value is 42!");
});

server.listen(PORT, () => {
  console.log(`🚀 Listening on port ${PORT}...`);
});
