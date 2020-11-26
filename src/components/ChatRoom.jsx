import { Component } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import socket from '../server/socket';
import '../css/ChatRoom.scss';
import 'animate.css'
import Commands from '../commands';
import { nanoid } from 'nanoid';

class ChatRoom extends Component {
	constructor(props) {
		super(props);
		this.state = {
			room_code: props.match.params.room_code,
			username: '',
			user_id: socket.id,
			messageToSend: '',
			messages: [],
			usersTyping: '',
			isTyping: false,
			showUser: false,
			users: [],
			username_array: []
		}

		socket.off(Commands.RECEIVE_MESSAGE).on(Commands.RECEIVE_MESSAGE, data => {
			let senderMessage = data.user_id === socket.id;
			let username = (socket.id === data.user_id)? "You" : data.username;
			let className = `animate__animated animate__faster message ${senderMessage? "animate__fadeInRight current-user" : "animate__fadeInLeft other-user"}`

			this.state.messages.push({
				message: data.message,
				username: username,
				user_id: data.user_id,
				className: className,
			});

			this.setState((state) => {
				return {user_id: state.user_id};
			});
		});

		socket.off(Commands.USER_DISCONNECT).on(Commands.USER_DISCONNECT, data => {
			let username = (socket.id === data.user_id)? "You" : data.username;
			let className = `animate__animated animate__faster animate__fadeInLeft left`;
			this.state.messages.push({
				message: `${username} left.`,
				className: className
			});

			let idx = this.state.users.indexOf(username);
			this.state.users.splice(idx, 1);

			this.setState((state) => {
				return {
					user_id: state.user_id,
					username_array: data.username_array
				};
			});

		});

		socket.off(Commands.USER_TYPING).on(Commands.USER_TYPING, data => {
			
			if(!this.state.typing) {
				let msg = `${data.username} is typing...`
			
				this.setState({
					usersTyping: msg,
					isTyping: true
				})

				setTimeout(() => {
					this.setState({
						usersTyping: '',
						isTyping: false
					});
				}, 2000);
			}
		});

		this.sendMessage = this.sendMessage.bind(this);
		this.onMessageChange= this.onMessageChange.bind(this);
		this.keyPressHandler = this.keyPressHandler.bind(this);
		this.displayUsers = this.displayUsers.bind(this);
		this.closeModal = this.closeModal.bind(this);
	}

	componentDidMount() {
		socket.emit(Commands.UPDATE_INFO, {
			room_code: this.state.room_code,
			username: '',
			user_id: this.state.user_id
		});

		socket.on(Commands.UPDATE_INFO, data => {
			this.setState({
				username: data.username,
				user_id: data.user_id,
				username_array: data.username_array
			});
		});

		socket.on(Commands.USER_JOIN, data => {
			let username = (socket.id === data.user_id)? "You" : data.username;
			let className = `animate__animated animate__faster animate__fadeInLeft joined`;
			this.state.messages.push({
				message: `${username} joined.`,
				className: className
			});
			
			this.state.users.push(username);

			this.setState((state) => {
				return {
					user_id: state.user_id,
					username_array: data.username_array
				};
			});
		});
	}

	sendMessage(event) {
		if(this.state.messageToSend === '') {
			event.preventDefault()
		
		} else {
			socket.emit(Commands.SEND_MESSAGE, {
				room_code: this.state.room_code,
				user_id: this.state.user_id,
				username: this.state.username,
				message: this.state.messageToSend
			});

			this.setState({
				messageToSend: ''
			});
		} 
	}
	
	onMessageChange(event) {
		this.setState({
			messageToSend: event.target.value
		});

		socket.emit(Commands.USER_TYPING, {
			room_code: this.state.room_code,
			user_id: this.state.user_id,
			username: this.state.username
		});
	}

	keyPressHandler(event) {
		let key = event.key;

		if(key === "Enter") {
			this.sendMessage(event);
		}
	}

	displayUsers() {
		this.setState({
			showUser: true
		});
	}

	closeModal() {
		this.setState({
			showUser: false
		});
	}

	render() {
		return(
			<div className="chat-room">

				<Modal animation={false} show={this.state.showUser} onHide={this.closeModal}>
					<Modal.Header>
						<Modal.Title>Users Online</Modal.Title>
					</Modal.Header>

					<Modal.Body>
						<ul className="users">
							{this.state.username_array.map((user) => (
								<li key={nanoid()}>{user}</li>
							))}
						</ul>
					</Modal.Body>

					<Modal.Footer>
						<Button variant="danger" onClick={this.closeModal}>Close</Button>
					</Modal.Footer>
				</Modal>

				<div className="header">
					<div className="info">
						<div className="room-code">Room: <span className="grey">{this.state.room_code}</span></div>
						<div className="username">Username: <span className="grey">{this.state.username}</span></div>
					</div>

					<Button variant="primary" onClick={this.displayUsers}>Users</Button>
				</div>

				<ul className="messages">
					{this.state.messages.map( (messageData, i) => (
						<li key={i} className={messageData.className}>
							<span>{messageData.message}</span>
							<div className="sender">{messageData.username}</div>
						</li>
					))}
				</ul>
				<div className="user-typing">{this.state.usersTyping}</div>

				<div className="send-message">
					<Form.Control type="text" placeholder="Enter Message" value={this.state.messageToSend} onChange={this.onMessageChange} onKeyPress={this.keyPressHandler}></Form.Control>
					<Button variant="success" onClick={this.sendMessage}>Send</Button>
				</div>
			</div>
		);
	}
}

export default ChatRoom;