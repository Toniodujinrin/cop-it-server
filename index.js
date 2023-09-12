const express = require("express");
const csp = require("express-csp-header")
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



app.use(csp.expressCspHeader({
  policies:{
    "default-src":[csp.SELF],
    "img-src":[csp.SELF],
  }
}))

app.use(express.static("statics"))
app.get("/",(req,res)=>{
  res.send("welcome")
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

 

https.createServer({
  key: fs.readFileSync("./cert/key.pem","utf-8"),
  cert: fs.readFileSync("./cert/cert.pem","utf-8")
  },app).listen(process.env.HTTPS_PORT, ()=>{
    console.log(
      "\x1b[36m%s\x1b[0m",
      ` express server is listening on port ${process.env.HTTPS_PORT}`
    )
  })

http.createServer(app).listen(process.env.EXPRESS_PORT, () => {
  console.log(
    "\x1b[36m%s\x1b[0m",
    ` express server is listening on port ${process.env.EXPRESS_PORT}`
  );
});


