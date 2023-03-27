const express = require("express");
const cors = require("cors");
require("dotenv").config();
const startup = require("./startup");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());
startup(app);

app.listen(process.env.EXPRESS_PORT, () => {
  console.log(
    "\x1b[36m%s\x1b[0m",
    ` express server is listening on port ${process.env.EXPRESS_PORT}`
  );
});
