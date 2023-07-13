import express from "express";
import http from "http";
import { Server } from "socket.io";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const server = http.Server(app);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/client/index.html');
});

app.use('/client', express.static(__dirname + '/client'));

server.listen(3000);
console.log("Server started");

const SOCKET_LIST = {};

const io = new Server(server);

io.on("connection", (socket) => {
    socket.id = Math.random();
    socket.x = 0;
    socket.y = 0;
    socket.number = "" + Math.floor(10 * Math.random());

    SOCKET_LIST[socket.id] = socket;
    

    socket.on("disconnect", () => {
        delete SOCKET_LIST[socket.id];
    });
});

setInterval(() => {
    const pack = [];
    for(let i in SOCKET_LIST){
        const socket = SOCKET_LIST[i];
        socket.x++;
        socket.y++;

        pack.push({
            x: socket.x,
            y: socket.y,
            number: socket.number
        });
    }

    for(let i in SOCKET_LIST){
        const socket = SOCKET_LIST[i];
        socket.emit('newPositions', pack);
    }

}, 1000 / 25);