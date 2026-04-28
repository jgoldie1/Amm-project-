socket.on("chat", (msg) => {
  io.emit("chat", {
    user: "User",
    msg: msg
  });

  // SIMPLE BOT (GEN Z / GEN X)
  if (Math.random() < 0.3) {
    let reply = "cool";

    if (msg.includes("/genz")) reply = "no cap 🔥";
    if (msg.includes("/genx")) reply = "back in my day 😎";

    setTimeout(() => {
      io.emit("chat", {
        user: "StubbsAI",
        msg: reply
      });
    }, 800);
  }
});
