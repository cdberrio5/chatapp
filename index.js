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

app.use(express.json());

// 🔹 Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// 🔹 Rutas
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/notifications", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "notifications.html"));
});

app.post("/webhook", (req, res) => {
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

        var msg = webhookData.data.buyer.name + " " + webhookData.data.buyer.last_name + " ha sido despertado de la Matrix"

        // Emitir una notificación a todos los clientes conectados
        io.emit("webhookNotification", {
            msg
        });

        res.status(200).send("Webhook recibido, datos guardados y notificación enviada.");
    });
});

app.get("/descargar-log", (req, res) => {
    const file = `${__dirname}/log.json`;
    res.download(file, "log.json", (err) => {
        if (err) {
            console.error("Error al enviar el archivo:", err);
            res.status(500).send("Error al enviar el archivo.");
        }
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
