const express = require("express");
const https = require("https");
const fs = require("fs");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const morgan = require("morgan");
const passport = require("passport");
const cookieSession = require("cookie-session");
const { Strategy } = require("passport-google-oauth20");
require("dotenv").config();

const PORT = 6002;
const AUTH_URL = "/auth/google/callback";
const config = {
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET,
  COOKIE_KEY_1: process.env.COOKIE_KEY_1,
  COOKIE_KEY_2: process.env.COOKIE_KEY_2,
};
const AUTH_OPTIONS = {
  callbackURL: AUTH_URL,
  clientID: config.CLIENT_ID,
  clientSecret: config.CLIENT_SECRET,
};

const verifyCallback = (accessToken, refreshToken, profile, done) => {
  console.log("Google profile", profile);
  done(null, profile);
};

passport.use(new Strategy(AUTH_OPTIONS, verifyCallback));

const app = express();
app.use(helmet());
app.use(
  cookieSession({
    name: "session",
    maxAge: 24 * 60 * 60 * 1000, // 24h
    keys: [config.COOKIE_KEY_1, config.COOKIE_KEY_2],
  })
);
app.use(passport.initialize());
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

app.get(
  AUTH_URL,
  passport.authenticate("google", {
    failureRedirect: "/failure",
    successRedirect: "/",
    session: false,
  }),
  (req, res) => {
    console.log("Google called us back");
  }
);

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["email"],
  })
);

app.get("/auth/logout", (req, res) => {});

app.get("/failure", (req, res) => res.send("Failed to log in"));

app.get("/secret", checkLoggedIn, (req, res) =>
  res.send("The secret value is 42!")
);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

server.listen(PORT, () => {
  console.log(`🚀 Listening on port ${PORT}...`);
});
