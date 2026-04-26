const express = require("express");
const path = require("path");

const app = express();

// ✅ serve all files in root
app.use(express.static(__dirname));

// ✅ force index.html on homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(10000, () => {
  console.log("RUNNING ON PORT 10000");
});
