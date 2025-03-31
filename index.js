// 🔹 Importaciones
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const fs = require("fs");

// 🔹 Inicialización de la app y el servidor
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 🔹 Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// 🔹 Rutas
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/", (req, res) => {
    const webhookData = req.body;
  
    // Convertir el objeto a un string JSON con formato legible
    const dataToWrite = JSON.stringify(webhookData, null, 2);
  
    // Escribir el contenido en el archivo log.json
    fs.writeFile("log.json", dataToWrite, (err) => {
      if (err) {
        console.error("Error al escribir en log.json:", err);
        return res.status(500).send("Error al guardar los datos del webhook.");
      }
      console.log("Datos del webhook guardados correctamente.");
      res.status(200).send("Webhook recibido y datos guardados.");
    });
  });

// 🔹 Manejo de WebSockets
io.on("connection", (socket) => {
    console.log("🔵 Un usuario se ha conectado");

    socket.on("join", (name) => {
        socket.broadcast.emit("message", {
            name: "Sistema",
            message: `${name} se ha unido al chat`,
            time: new Date().toLocaleTimeString(),
        });
    });

    socket.on("message", (msg) => {
        io.emit("message", msg);
    });

    socket.on("disconnect", () => {
        console.log("🔴 Un usuario se ha desconectado");
    });
});

// 🔹 Iniciar el servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
