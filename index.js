const functions = require("firebase-functions");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../public", "index.html"));
});

io.on("connection", (socket) => {
    console.log("Un usuario se ha conectado");

    socket.on("join", (name) => {
        socket.broadcast.emit("message", { name: "Sistema", message: `${name} se ha unido al chat`, time: new Date().toLocaleTimeString() });
    });

    socket.on("message", (msg) => {
        io.emit("message", msg);
    });

    socket.on("disconnect", () => {
        console.log("Un usuario se ha desconectado");
    });
});

exports.app = functions.https.onRequest(app);
