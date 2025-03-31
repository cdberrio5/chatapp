const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCx7P8bwHgfb6cqsXsvKf8DxMzZJLaJVMY",
  authDomain: "chatapp-a1cda.firebaseapp.com",
  projectId: "chatapp-a1cda",
  storageBucket: "chatapp-a1cda.firebasestorage.app",
  messagingSenderId: "850149082225",
  appId: "1:850149082225:web:5ca4596642cb6cbcaa07d0"
};

// Initialize Firebase
const firebase = initializeApp(firebaseConfig);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

io.on('connection', (socket) => {
    console.log('Un usuario se ha conectado');

    socket.on('join', (name) => {
        socket.broadcast.emit('message', { name: 'Sistema', message: `${name} se ha unido al chat`, time: new Date().toLocaleTimeString() });
    });

    socket.on('message', (msg) => {
        io.emit('message', msg);
    });

    socket.on('disconnect', () => {
        console.log('Un usuario se ha desconectado');
    });
});

server.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});
