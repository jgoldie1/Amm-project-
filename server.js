const { AccessToken } = require("livekit-server-sdk");

app.get("/get-token", (req, res) => {
  const room = "main-room";
  const username = "user-" + Math.floor(Math.random() * 10000);

  const at = new AccessToken("YOUR_API_KEY", "YOUR_SECRET", {
    identity: username,
  });

  at.addGrant({ roomJoin: true, room });

  res.json({ token: at.toJwt(), room });
});
