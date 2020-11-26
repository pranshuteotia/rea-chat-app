import { Component } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
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
			generated_room_code: customAlphabet("123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ", 10)(),
			username: '',
			show_username_error: false,
			show_roomcode_error: false,
			open_rooms: []
		}

		socket.off(Commands.UPDATE_ROOMS).on(Commands.UPDATE_ROOMS, data => {
			console.log(data);

			this.setState({
				open_rooms: data.open_rooms
			});
		});

		this.switchTabs = this.switchTabs.bind(this);
		this.onRoomCodeChange = this.onRoomCodeChange.bind(this);
		this.onUsernameChange = this.onUsernameChange.bind(this);
		this.createRoom = this.createRoom.bind(this);
		this.joinRoom = this.joinRoom.bind(this);
		this.keyPressHandler = this.keyPressHandler.bind(this);
		this.closeModal = this.closeModal.bind(this);
	}

	componentDidMount() {
		socket.emit(Commands.UPDATE_ROOMS, {});
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

	keyPressHandler(event) {
		let key = event.key;

		if(key === "Enter") {
			
			if(this.state.active) {
				this.joinRoom(event);

				if(this.state.username !== '' && this.state.open_rooms.includes(this.state.room_code)) {
					this.props.history.push(`/${this.state.room_code}/ChatRoom`);
				}
			
			} else {
				this.createRoom(event);

				if(this.state.username !== '') {
					this.props.history.push(`/${this.state.generated_room_code}/ChatRoom`);
				}
			}
		}
	}

	createRoom(event) {
		if(this.state.username === '') {
			event.preventDefault();
			this.setState({
				show_username_error: true
			});
		
		} else {
			socket.emit(Commands.CREATE_ROOM, {
				room_code: this.state.generated_room_code,
				username: this.state.username,
				user_id: socket.id
			});
		}
	}

	joinRoom(event) {
		if(!this.state.open_rooms.includes(this.state.room_code)) {
			event.preventDefault();
			this.setState({
				show_roomcode_error: true
			});
		
		} else if(this.state.username === '') {
			event.preventDefault();
			this.setState({
				show_username_error: true
			});
		
		} else {
			socket.emit(Commands.JOIN_ROOM, {
				room_code: this.state.room_code,
				username: this.state.username,
				user_id: socket.id
			});
		}
	}

	closeModal() {
		this.setState({
			show_username_error: false,
			show_roomcode_error: false
		});
	}

	render() {
		return(
			<div className="home-container">
				<Modal animation={false} show={this.state.show_username_error} onHide={this.closeModal}>
					<Modal.Header>
						Error!
					</Modal.Header>

					<Modal.Body>
						Username cannot be empty!
					</Modal.Body>

					<Modal.Footer>
						<Button variant="danger" onClose={this.closeModal} onClick={this.closeModal}>Close</Button>
					</Modal.Footer>
				</Modal>

				<Modal animation={false} show={this.state.show_roomcode_error} onHide={this.closeModal}>
					<Modal.Header>
						Error!
					</Modal.Header>

					<Modal.Body>
						Room code is invalid!
					</Modal.Body>

					<Modal.Footer>
						<Button variant="danger" onClose={this.closeModal} onClick={this.closeModal}>Close</Button>
					</Modal.Footer>
				</Modal>

				<h1>React Chat App</h1>

				<div className="options">
					<div id="signup" className={`option ${(!this.state.active)? "active": ""}`} onClick={this.switchTabs}>Create Room</div>
					<div id="login" className={`option ${(this.state.active)? "active": ""}`} onClick={this.switchTabs}>Join Room</div>
				</div>

				<div className="display">
						<Form className={`${(this.state.active)?"": "hidden"}`}>
							<Form.Group controlId="room-code">
								<Form.Label>Room Code</Form.Label>
								<Form.Control type="text" placeholder="Enter room code" value={this.state.room_code} onChange={this.onRoomCodeChange} onKeyPress={this.keyPressHandler} />
							</Form.Group>

							<Form.Group controlId="join-username">
								<Form.Label>Username</Form.Label>
								<Form.Control type="text" placeholder="Enter username" value={this.state.username} onChange={this.onUsernameChange} onKeyPress={this.keyPressHandler} />
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
								<Form.Control type="text" placeholder="Enter username" value={this.state.username} onChange={this.onUsernameChange} onKeyPress={this.keyPressHandler} />
							</Form.Group>

							<Link to={`/${this.state.generated_room_code}/ChatRoom`}><Button variant="primary" onClick={this.createRoom}>Create Room</Button></Link>
						</Form>
				</div>
			</div>
		);
	}
}

export default Home;