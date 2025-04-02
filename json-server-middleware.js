// JSON Server middleware for handling CORS and pagination
module.exports = (req, res, next) => {
  // Set CORS headers
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  // Ensure pagination headers are properly sent
  const _send = res.send;
  res.send = function (body) {
    if (require("url").parse(req.url, true).query._page) {
      // If X-Total-Count header isn't already set and this is a GET request with pagination
      if (!res.getHeader("X-Total-Count") && req.method === "GET") {
        // Count total items in the collection
        const db = require("./db.json");
        const resourceName = req.path.slice(1).split("?")[0]; // Extract resource name from path

        if (db[resourceName]) {
          const count = db[resourceName].length;
          console.log(`Setting X-Total-Count: ${count} for ${resourceName}`);
          res.setHeader("X-Total-Count", count.toString());
        }
      }

      // Ensure pagination headers are exposed
      res.header("Access-Control-Expose-Headers", "X-Total-Count");
    }

    return _send.call(this, body);
  };

  next();
};
