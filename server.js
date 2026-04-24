// save comments
let comments = {};

app.post("/comment", express.json(), (req, res) => {
  const { video, text } = req.body;

  if (!comments[video]) {
    comments[video] = [];
  }

  comments[video].push(text);

  res.json({ success: true });
});

// get comments
app.get("/comments", (req, res) => {
  res.json(comments);
});
