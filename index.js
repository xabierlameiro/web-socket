/**
 * @type {any}
 */
const WebSocket = require("ws");
const http = require("http");
const StaticServer = require("node-static").Server;
const setupWSConnection = require("y-websocket/bin/utils").setupWSConnection;

const production = process.env.PRODUCTION != null;
const port = process.env.PORT || 8080;

const staticServer = new StaticServer("../", {
  cache: production ? 3600 : false,
  gzip: production,
});

const server = http.createServer((request, response) => {
  request
    .addListener("end", () => {
      console.log(`Serving ${request.url}`);
      staticServer.serve(request, response);
    })
    .resume();
});
const wss = new WebSocket.Server({ server });

wss.on("connection", (conn, req) => {
  const room = req.url.slice(1);
  console.log(`New connection to ${room}`);
  setupWSConnection(conn, room);
  conn.on("close", () => console.log(`Closed connection to ${room}`));

  conn.on("message", (message) => {
    console.log(`Message from ${room}: ${message}`);
  });

  conn.on("error", (error) => {
    console.log(`Error in ${room}: ${error}`);
  });
});

server.listen(port);

console.log(
  `Listening to http://localhost:${port} ${production ? "(production)" : ""}`
);
