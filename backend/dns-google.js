const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

console.log("Using:", dns.getServers());

dns.resolveSrv(
  "_mongodb._tcp.sasdb.5kkljwe.mongodb.net",
  (err, records) => {
    if (err) {
      console.error(err);
    } else {
      console.log(records);
    }
  }
);