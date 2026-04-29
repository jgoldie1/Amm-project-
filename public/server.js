const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("SERVER IS WORKING");
});

app.listen(process.env.PORT || 3000, () => console.log("RUNNING"));
