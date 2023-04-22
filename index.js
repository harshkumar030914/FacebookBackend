const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

// routes
const AuthRoute = require("./routes/Authroutes.js");
const UserRoute = require("./routes/UserRoutes.js");
// roter config
const PORT = 9000;
const app = express();
app.use(
  cors({
    methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
  })
);
app.use(
  cors({
    origin: "*",
  })
);
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: false }));
app.get("/", (req, res) => {
  res.send("Welcome to Facebook Backend App");
});

// Mongo Connection
//const CONNECTION = "mongodb://localhost:27017/Facebook";
const CONNECTION = "mongodb+srv://Harsh:HarshKumar1493@cluster0.wdhgsjm.mongodb.net/test";
mongoose
  .connect(CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => app.listen(PORT, () => console.log(`Listening at Port ${PORT}`)))
  .catch((error) => console.log(`${error} did not connect`));

// Auth User

app.use("/media", express.static("./media/videos"));

app.use("/auth", AuthRoute);
app.use("/user", UserRoute);
