const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static("public")); // Servir arquivos estáticos

let isAdminAssigned = false;
let currentImageIndex = 0;
let images = [
    "img/img1.jpg",
    "img/img2.jpg",
    "img/img3.jpg"
];


let highestBid = { name: "", bid: 0 }; // Maior lance

io.on("connection", (socket) => {
    console.log("Usuário conectado:", socket.id);

    if (!isAdminAssigned) {
        socket.emit("redirect", "/admin.html");
        isAdminAssigned = true;
    } else {
        socket.emit("redirect", "/user.html");
    }

    socket.on("requestData", () => {
        socket.emit("updateImage", images[currentImageIndex]);
        socket.emit("updateBid", highestBid);
    });

    socket.on("changeImage", (direction) => {
        if (direction === "next") {
            currentImageIndex = (currentImageIndex + 1) % images.length;
        } else {
            currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
        }
        highestBid = { name: "", bid: 0 }; // Reseta o maior lance
        io.emit("updateImage", images[currentImageIndex]);
        io.emit("updateBid", highestBid);
    });

    socket.on("newBid", (data) => {
        if (data.bid > highestBid.bid) {
            highestBid = data;
            io.emit("updateBid", highestBid);
        }
    });

    socket.on("disconnect", () => {
        console.log("Usuário desconectado:", socket.id);
    });
});

server.listen(3000, () => {
    console.log("Servidor rodando em http://localhost:3000");
});
