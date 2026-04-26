const express = require("express");
const path = require("path");

const app = express();

// serve frontend
app.use(express.static(__dirname));

// health check (important for Render stability)
app.get("/health", (req, res) => {
  res.send("OK");
});

// always return index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("RUNNING ON PORT " + PORT);
});
