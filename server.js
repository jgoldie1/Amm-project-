const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { AccessToken } = require("livekit-server-sdk");

const app = express(); // ✅ THIS WAS MISSING

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

/* ROOT */
app.get("/", (req, res) => {
  res.send("Server running 🚀");
});

/* LIVEKIT TOKEN */
app.get("/get-token", (req, res) => {
  const room = "main-room";
  const username = "user-" + Math.floor(Math.random() * 10000);

  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
    {
      identity: username,
    }
  );

  at.addGrant({ roomJoin: true, room });

  res.json({ token: at.toJwt(), room });
});

/* START SERVER */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("RUNNING ON PORT " + PORT);
});
