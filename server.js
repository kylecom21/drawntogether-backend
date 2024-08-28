const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: "https://drawntogether-backend.onrender.com/",
		methods: ["GET", "POST"],
	},
});

let currentDrawer = null;
let players = [];
let currentWord = "";
let timer = null; // Timer reference
let timerDuration = 0; // Timer duration in seconds
let usernames = new Map(); // Store usernames here

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
		const username = usernames.get(socket.id) || `Player ${socket.id}`;
		console.log(`${username} guessed: ${guess}`);
		if (guess.toLowerCase() === currentWord.toLowerCase()) {
			io.emit("chat-message", {
				name: "System",
				message: `${username} guessed the word!`,
				isOwnMessage: false,
			});
		}
	});

	socket.on("send-chat-message", (messageData) => {
		const username =
			usernames.get(socket.id) ||
			messageData.name ||
			`Player ${socket.id}`;
		if (messageData.message.toLowerCase() === currentWord.toLowerCase()) {
			io.emit("chat-message", {
				name: "System",
				message: `${username} guessed the word!`,
				isOwnMessage: false,
			});
		} else {
			socket.broadcast.emit("chat-message", {
				name: username,
				message: messageData.message,
				isOwnMessage: false,
			});
		}
	});

	// Timer functionality
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

	socket.on("new-user", (name) => {
		usernames.set(socket.id, name);
		socket.broadcast.emit("user-connected", name);
	});

	socket.on("disconnect", () => {
		console.log("User disconnected");
		const username = usernames.get(socket.id);
		players = players.filter((id) => id !== socket.id);
		usernames.delete(socket.id);
		if (currentDrawer === socket.id) {
			currentDrawer = players[0] || null;
			if (currentDrawer) {
				io.to(currentDrawer).emit("start-drawing");
			}
		}
		if (username) {
			socket.broadcast.emit("user-disconnected", username);
		}
	});
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
