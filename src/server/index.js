const path = require('path');
const express = require('express');
const app = express();
const Commands = require('../commands');

// Need this so that it works on localhost. *Remove it when pushing to heroku*.
const options = {
	cors: {
		origin: "http://localhost:3000",
		credentials: true
	}
}
const server = require('http').createServer(app);
const io = require('socket.io')(server, options);
const port = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, '../../build')));

// Path to index file such that heroku can find it.
app.get('/', (req, res, next) => res.sendFile(__dirname + './index.html'));

const CONNECTED_USERS = {};
const OPEN_ROOMS = {};

io.on('connection', socket => {
	let user_id = socket.id;
	console.log(`User connected. ID: ${user_id}`);
	CONNECTED_USERS[user_id] = {
		room_code: '',
		username: ''
	};

	socket.on(Commands.CREATE_ROOM, data => {
		let room_code = data.room_code;
		let host_id = data.user_id;
		let username = data.username;

		CONNECTED_USERS[host_id] = {
			room_code,
			username
		};

		OPEN_ROOMS[room_code] = {
			users: {
				host_id: {
					username
				}
			}
		};

		io.in(room_code).emit(Commands.USER_JOIN, {
			user_id: host_id,
			room_code,
			username
		});

		socket.join(room_code);
	});

	socket.on(Commands.JOIN_ROOM, data => {
		let room_code = data.room_code;
		let user_id = data.user_id;
		let username = data.username;

		CONNECTED_USERS[user_id] = {
			room_code,
			username
		};

		CONNECTED_USERS[room_code] = {
			users: {
				user_id: {
					username
				}
			}
		};

		io.in(room_code).emit(Commands.USER_JOIN, {
			user_id,
			room_code,
			username
		});

		socket.join(room_code);
	});

	socket.on(Commands.UPDATE_INFO, data => {
		let room_code = data.room_code;
		let user_id = data.user_id;
		let username = CONNECTED_USERS[user_id].username;

		io.to(user_id).emit(Commands.UPDATE_INFO, {
			room_code,
			username,
			user_id
		});
	});

	socket.on(Commands.SEND_MESSAGE, data => {
		let room_code = data.room_code;

		io.in(room_code).emit(Commands.RECEIVE_MESSAGE, {
			room_code: room_code,
			user_id: data.user_id,
			username: data.username,
			message: data.message
		});
	});

	socket.on(Commands.USER_TYPING, data => {
		let room_code = data.room_code;
		let user_id = data.user_id;
		let username = data.username;

		socket.broadcast.to(room_code).emit(Commands.USER_TYPING, {
			room_code,
			user_id,
			username
		});
	});

	socket.on('disconnect', () => {
		let user_id = socket.id;
		let room_code = CONNECTED_USERS[user_id].room_code;

		io.in(room_code).emit(Commands.USER_DISCONNECT, {
			user_id,
			username: CONNECTED_USERS[user_id].username
		});

		if(CONNECTED_USERS[user_id].room_code !== '' ) {
			delete OPEN_ROOMS[room_code].users[user_id];
			socket.leave(room_code);
		}
		
		delete CONNECTED_USERS[user_id];
		console.log(`User disconnected. ID: ${user_id}`);

	});
});

server.listen(port, () => {
	console.log(`Listening on port: ${port}`);
});