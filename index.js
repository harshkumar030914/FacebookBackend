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
app.get("/", async (req, res) => {
  // res.send("Welcome to Facebook Backend App");
  const axios = require("axios");

  const options = {
    method: "GET",
    url: "https://deezerdevs-deezer.p.rapidapi.com/search",
    params: { q: "Another Love" },
    headers: {
      "content-type": "application/octet-stream",
      "X-RapidAPI-Key": "109e8bf8e5msh335babc8b875b32p14c87bjsn07d1f578c490",
      "X-RapidAPI-Host": "deezerdevs-deezer.p.rapidapi.com",
    },
  };
  try {
    const response = await axios.request(options);
    // console.log(response.data);
    res.send(response.data);
  } catch (error) {
    console.error(error);
  }
});

// Mongo Connection

//mongodb+srv://Harsh:<password>@cluster0.wdhgsjm.mongodb.net/test
//mongodb://localhost:27017/Facebook
// const CONNECTION = "mongodb+srv://Harsh:HarshKumar1493@cluster0.wdhgsjm.mongodb.net/test";
const CONNECTION = "mongodb://localhost:27017/Facebook";
mongoose
  .connect(CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() =>
    app.listen(PORT, async () => {
      console.log("connect");
    })
  )
  .catch((error) => console.log(`${error} did not connect`));

// Auth User

app.use("/media", express.static("./media/videos"));

app.use("/auth", AuthRoute);
app.use("/user", UserRoute);
