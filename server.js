import http from "http";
import cluster from "cluster";
import fs from "node:fs";
import os from 'os';

const hostname = "localhost";
const port = 3000;

// Utilisez le nombre de cœurs physiques disponibles
const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  console.log(`Primary pid ${process.pid}`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
  });
} else {
  http
    .createServer((req, res) => {
      console.log(req.url, req.method);

      // Set header content type
      res.setHeader("Content-Type", "text/html");

      let path = "./views/";

      switch (req.url) {
        case "/":
          path += "index.html";
          break;
        case "/about":
          path += "about.html";
          break;
        default:
          path += "404.html";
          break;
      }

      // Send an html file
      fs.readFile(path, (err, data) => {
        if (err) {
          console.log(err);
          res.end();
        } else {
          res.end(data);
        }
      });
    })
    .listen(port, hostname, () => {
      console.log(`Server running at http://${hostname}:${port}/`, process.pid);
    });
}
