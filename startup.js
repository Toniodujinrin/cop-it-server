const routes = require("./routes");

module.exports = function startup(app) {
  const posts = (currentRoute) => {
    app.post(`/${currentRoute}`, (req, res) => {
      const data = {};
      data.headers = req.headers;
      data.query = req.query;
      data.payload = req.body;

      finish(res, currentRoute, "post", data);
    });
  };
  const gets = (currentRoute) => {
    app.get(`/${currentRoute}`, (req, res) => {
      const data = {};
      data.headers = req.headers;
      data.query = req.query;
      data.payload = req.body;
      console.log(data);
      finish(res, currentRoute, "get", data);
    });
  };
  const puts = (currentRoute) => {
    app.put(`/${currentRoute}`, (req, res) => {
      const data = {};
      data.headers = req.headers;
      data.query = req.query;
      data.payload = req.body;

      finish(res, currentRoute, "put", data);
    });
  };
  const deletes = (currentRoute) => {
    app.delete(`/${currentRoute}`, (req, res) => {
      const data = {};
      data.headers = req.headers;
      data.query = req.query;
      data.payload = req.body;

      finish(res, currentRoute, "delete", data);
    });
  };

  const finish = (res, currentRoute, method, data) => {
    console.log(method);
    routes[currentRoute][method](data, (statusCode, responseObject) => {
      const stringPayload =
        typeof responseObject == "object" && responseObject !== null
          ? JSON.stringify(responseObject)
          : "";
      const _statusCode =
        typeof statusCode == "number" && statusCode >= 200 && statusCode < 600
          ? statusCode
          : 200;

      res.setHeader("Content-Type", "application/json");
      res.writeHead(_statusCode);
      res.write(stringPayload);
      res.end();
    });
  };
  posts("products");
  gets("products");
  posts("reviews");
  posts("users");
  posts("users/verifyEmail");
  posts("auth");
  posts("users/verifyAccount");
  posts("basket/add");
  posts("basket/editItemAmount");
  gets("auth/checkVerified");
  gets("users/getUserDetails");
  deletes("products");
};
