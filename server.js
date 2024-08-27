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
let currentWord = "word";

io.on("connection", (socket) => {
	console.log("A user connected");
	players.push(socket.id);
	socket.isArtist = false;

	if (players.length === 1) {
		currentDrawer = socket.id;
		socket.currentDrawer = true;
		socket.emit("start-drawing");
	} else {
		socket.emit("current-word", { word: currentWord });
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

	socket.on("new-word", (data) => {
		currentWord = data.word;
		socket.broadcast.emit("new-word", { word: currentWord });
	});

	socket.on("request-current-word", () => {
		socket.emit("current-word", { word: currentWord });
	});

	socket.on("guess", (guess) => {
		console.log(`Player ${socket.id} guessed: ${guess}`);
		if (guess.toLowerCase() === currentWord.toLowerCase()) {
			io.emit("chat-message", {
				name: "System",
				message: `Player ${socket.id} guessed the word!`,
				isOwnMessage: false,
			});
		}
	});

	socket.on("send-chat-message", (message) => {
		if (message.toLowerCase() === currentWord.toLowerCase()) {
			console.log(players);
			io.emit("chat-message", {
				name: "System",
				message: `Player ${socket.id} guessed the word!`,
				isOwnMessage: false,
			});
		} else {
			socket.broadcast.emit("chat-message", message);
		}
	});

	socket.on("start-timer", (duration) => {
		if (socket.id === currentDrawer) {
			clearInterval(timer); // Clear any existing timer
			timerDuration = duration; // Set the duration
			io.emit("timer-update", timerDuration); // Broadcast initial timer value to all clients

			timer = setInterval(() => {
				timerDuration--;
				io.emit("timer-update", timerDuration); // Broadcast updated timer value to all clients

				if (timerDuration <= 0) {
					clearInterval(timer);
					io.emit("timer-ended"); // Notify all clients that the timer has ended
				}
			}, 1000);
		}
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
