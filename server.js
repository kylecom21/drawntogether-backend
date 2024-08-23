const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: "https://drawn-together.netlify.app",
		methods: ["GET", "POST"],
	},
});

let currentDrawer = null;
let players = [];

io.on("connection", (socket) => {
	console.log("A user connected");
	players.push(socket.id);

	if (players.length === 1) {
		currentDrawer = socket.id;
		socket.emit("start-drawing");
	}

	socket.on("draw", (data) => {
		socket.broadcast.emit("draw", data);
	});

	socket.on("fill", (data) => {
		socket.broadcast.emit("fill", data);
	});

	socket.on("undo", () => {
		socket.broadcast.emit("undo");
	});

	socket.on("redo", () => {
		socket.broadcast.emit("redo");
	});

	socket.on("guess", (guess) => {
		// Implement guess checking logic here
		console.log(`Player ${socket.id} guessed: ${guess}`);
	});

	socket.on("disconnect", () => {
		console.log("User disconnected");
		players = players.filter((id) => id !== socket.id);
		if (currentDrawer === socket.id) {
			currentDrawer = players[0] || null;
			if (currentDrawer) {
				io.to(currentDrawer).emit("start-drawing");
			}
		}
	});
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
