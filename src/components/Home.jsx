import { Component } from 'react';
import { Button, Form } from 'react-bootstrap';
import { customAlphabet } from 'nanoid';
import '../css/Home.scss'
import socket from '../server/socket';
import Commands from '../commands';
import { Link } from 'react-router-dom';

class Home extends Component {
	constructor(props) {
		super(props);

		this.state = {
			active: false,
			room_code: '',
			generated_room_code: customAlphabet("123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ", 5)(),
			username: ''
		}

		this.switchTabs = this.switchTabs.bind(this);
		this.onRoomCodeChange = this.onRoomCodeChange.bind(this);
		this.onUsernameChange = this.onUsernameChange.bind(this);
		this.createRoom = this.createRoom.bind(this);
		this.joinRoom = this.joinRoom.bind(this);
	}

	switchTabs(event) {
		let classList = event.target.classList;

		if(!classList.contains("active")) {
			this.setState((state) => {
				return {active: !state.active}
			});
		}
	}

	onRoomCodeChange(event) {
		this.setState({
			room_code: event.target.value
		});
	}

	onUsernameChange(event) {
		this.setState({
			username: event.target.value
		});
	}

	createRoom(event) {
		if(this.state.username === '') {
			event.preventDefault();
			console.log("Username can't be empty");
		
		} else {
			socket.emit(Commands.CREATE_ROOM, {
				room_code: this.state.generated_room_code,
				username: this.state.username,
				user_id: socket.id
			});
		}
	}

	joinRoom(event) {
		if(this.state.room_code === '') {
			event.preventDefault();
			console.log("Room code can't be empty.");
		
		} else if(this.state.username === '') {
			event.preventDefault();
			console.log("Username can't be empty.");
		
		} else {
			socket.emit(Commands.JOIN_ROOM, {
				room_code: this.state.room_code,
				username: this.state.username,
				user_id: socket.id
			});
		}
	}

	render() {
		return(
			<div className="home-container">
				<h1>React Chat App</h1>

				<div className="options">
					<div id="signup" className={`option ${(!this.state.active)? "active": ""}`} onClick={this.switchTabs}>Create Room</div>
					<div id="login" className={`option ${(this.state.active)? "active": ""}`} onClick={this.switchTabs}>Join Room</div>
				</div>

				<div className="display">
						<Form className={`${(this.state.active)?"": "hidden"}`}>
							<Form.Group controlId="room-code">
								<Form.Label>Room Code</Form.Label>
								<Form.Control type="text" placeholder="Enter room code" value={this.state.room_code} onChange={this.onRoomCodeChange} />
							</Form.Group>

							<Form.Group controlId="join-username">
								<Form.Label>Username</Form.Label>
								<Form.Control type="text" placeholder="Enter username" value={this.state.username} onChange={this.onUsernameChange} />
							</Form.Group>

							<Link to={`/${this.state.room_code}/ChatRoom`}><Button variant="primary" onClick={this.joinRoom}>Join Room</Button></Link>
						</Form>

						<Form className={`${(!this.state.active)?"": "hidden"}`}>
							<Form.Group controlId="gen-room-code">
								<Form.Label>Room Code</Form.Label>
								<Form.Control type="text" placeholder="Room code" value={this.state.generated_room_code} readOnly />
							</Form.Group>

							<Form.Group controlId="gen-username">
								<Form.Label>Username</Form.Label>
								<Form.Control type="text" placeholder="Enter username" value={this.state.username} onChange={this.onUsernameChange} />
							</Form.Group>

							<Link to={`/${this.state.generated_room_code}/ChatRoom`}><Button variant="primary" onClick={this.createRoom}>Create Room</Button></Link>
						</Form>
				</div>
			</div>
		);
	}
}

export default Home;