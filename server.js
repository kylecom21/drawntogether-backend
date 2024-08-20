const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: "*", // Allow all origins
		methods: ["GET", "POST"],
	},
});

io.on("connection", (socket) => {
	console.log("A user connected");

	socket.on("message", (data) => {
		console.log("Message received:", data);
		io.emit("message", data);
	});

	socket.on("disconnect", () => {
		console.log("User disconnected");
	});
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
