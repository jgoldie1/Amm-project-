const express = require("express");
const app = express();

app.use(express.static("public"));

app.get("/ping", (req, res) => {
  res.send("ok");
});

app.listen(process.env.PORT || 10000, () => {
  console.log("Server running");
});
