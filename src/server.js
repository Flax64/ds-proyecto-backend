require("dotenv").config();

//const db = require("./app");
const express = require("express");
const cors = require("cors");
const bycript = require("bcrypt");

const app = express();

app.use(cors());
app.use(express.json());




app.listen(3000, () => {
    console.log("Servidor corriendo");
});