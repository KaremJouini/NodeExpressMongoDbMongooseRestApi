const express = require("express");
const path = require("path");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const app = express();
const dotenv = require("dotenv");
dotenv.config();

// for handling forms submissions
app.use(express.urlencoded({ extended: false }));

// adding Helmet to enhance your API's security
app.use(helmet());

// enabling CORS for all requests
app.use(cors());

// adding morgan to log HTTP requests
app.use(morgan("combined"));
//Body parser middleware to handle json in request body
app.use(express.json());

//Jwt Authentication

app.use("/api/ads", require("./src/api/ads"));
app.use("/api/users", require("./src/api/users"));

const PORT = process.env.PORT || 4895;

app.listen(PORT, () => console.log("Server IS LISTENING ON ", PORT));
