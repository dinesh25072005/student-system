const dns = require("dns");

dns.resolveSrv(
  "_mongodb._tcp.sasdb.5kkljwe.mongodb.net",
  (err, addresses) => {
    if (err) {
      console.error("DNS Error:", err);
    } else {
      console.log(addresses);
    }
  }
);