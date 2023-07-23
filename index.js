const express = require("express");
const cors = require("cors");
const https = require("https")
const http = require("http")
const fs = require("fs")
require("dotenv").config();
const startup = require("./startup");
const bodyParser = require("body-parser");
const Processes = require('./processes')
const app = express();
Processes.init()

app.use(express.static("statics"))

app.use("/",(req,res)=>{
  res.send("welcom")
})

app.use(bodyParser.json({ limit: "50mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);
app.use(cors());
app.use(bodyParser.json());




startup(app);

 

const httpsServer = https.createServer({
  key: fs.readFileSync("./cert/key.pem","utf-8"),
  cert: fs.readFileSync("./cert/cert.pem","utf-8")
  },app)

const httpServer = http.createServer(app)

httpsServer.listen(process.env.HTTPS_PORT,()=>{
  console.log(
  "\x1b[35m%s\x1b[0m",
    ` https server is listening on port ${process.env.HTTPS_PORT}`
  )
})

httpServer.listen(process.env.EXPRESS_PORT, () => {
  console.log(
    "\x1b[36m%s\x1b[0m",
    ` express server is listening on port ${process.env.EXPRESS_PORT}`
  );
});


