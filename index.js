const express = require("express");
const formidable = require("express-formidable");
const cloudinary = require("cloudinary").v2;
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(formidable());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

console.log(process.env.CLOUDINARY_CLOUD_NAME);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, //en lien avec le fichier .env pour cacher les donnée sensible sur github
  api_key: process.env.CLOUDINARY_PUBLIC_KEY, 
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

//importe des route mod et routeur
const userRoute = require("./routes/user");
const offerRoute = require("./routes/offer");
app.use(userRoute);
app.use(offerRoute);


app.all("*", (req, res) => {
  res.status(404).json({ message: "Cette route n'existe pas" });
});

app.listen(process.env.PORT, () => { 
  console.log("Server Started");
});