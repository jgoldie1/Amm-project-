const express = require("express");
const multer = require("multer");
const fs = require("fs");

const app = express();

// create uploads folder if missing
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// serve folders
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

// upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + ".mp4")
});

const upload = multer({ storage });

// upload route
app.post("/upload", upload.single("video"), (req, res) => {
  res.json({ file: "/uploads/" + req.file.filename });
});

// get videos
app.get("/videos", (req, res) => {
  fs.readdir("uploads", (err, files) => {
    if (err) return res.json([]);
    res.json(files.map(f => "/uploads/" + f));
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
