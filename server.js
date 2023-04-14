const express = require("express");
const https = require("https");
const fs = require("fs");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const morgan = require("morgan");
require("dotenv").config();

const PORT = 6002;
const config = {
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET,
};

const app = express();
app.use(helmet());
app.use(
  cors({
    origin: "http://localhost:6002",
    optionsSuccessStatus: 200,
  })
);
app.use(morgan("combined")); //Use "dev" for dev output
app.use(express.json());

const checkLoggedIn = (req, res, next) => {
  const isLoggedIn = true; // TODO
  if (!isLoggedIn) {
    return res.status(401).json({
      error: "You must log in",
    });
  }
  next();
};

const server = https.createServer(
  {
    key: fs.readFileSync("key.pem"),
    cert: fs.readFileSync("cert.pem"),
  },
  app
);

app.get("/auth/google", (req, res) => {});

app.get("/auth/google/callback", (req, res) => {});

app.get("/auth/logout", (req, res) => {});

app.get("/secret", checkLoggedIn, (req, res) => {
  return res.send("The secret value is 42!");
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

server.listen(PORT, () => {
  console.log(`🚀 Listening on port ${PORT}...`);
});
