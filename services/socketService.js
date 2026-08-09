const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io;
const JWT_SECRET = process.env.JWT_SECRET || "supersecretweakkey123";

const initSocket = (server) => {
    io = new Server(server, {
        cors: { origin: "*" }
    });

    // Authentication for Socket.io
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) return next(new Error("Authentication error"));

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            socket.user = decoded;
            next();
        } catch (err) {
            next(new Error("Authentication error"));
        }
    });

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.user.id}`);
        socket.join(socket.user.id);
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.user.id}`);
        });
    });

    return io;
};

const getIo = () => {
    if (!io) throw new Error("Socket.io not initialized!");
    return io;
};

module.exports = { initSocket, getIo };
