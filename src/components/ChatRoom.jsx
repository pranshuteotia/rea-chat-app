import { Component } from 'react';
import { Button, Form } from 'react-bootstrap';
import socket from '../server/socket';
import '../css/ChatRoom.scss';
import 'animate.css'
import Commands from '../commands';

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
			isTyping: false
		}

		socket.off(Commands.RECEIVE_MESSAGE).on(Commands.RECEIVE_MESSAGE, data => {
			let senderMessage = data.user_id === socket.id;
			let username = (socket.id === data.user_id)? "You" : data.username;
			let className = `animate__animated animate__faster message ${senderMessage? "animate__fadeInRight current-user" : "animate__fadeInLeft other-user"}`

			this.state.messages.push({
				message: data.message,
				username: username,
				user_id: data.user_id,
				className: className
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

			this.setState((state) => {
				return {user_id: state.user_id};
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
				}, 3000);
			}
		});

		this.sendMessage = this.sendMessage.bind(this);
		this.onMessageChange= this.onMessageChange.bind(this);
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
				user_id: data.user_id
			});
		});

		socket.off(Commands.USER_JOIN).on(Commands.USER_JOIN, data => {
			let username = (socket.id === data.user_id)? "You" : data.username;
			let className = `animate__animated animate__faster animate__fadeInLeft joined`;
			this.state.messages.push({
				message: `${username} joined.`,
				className: className
			});

			this.setState((state) => {
				return {user_id: state.user_id};
			});
		});

		this.state.messages.push({
			message: "You joined.",
			className: `animate__animated animate__faster animate__fadeInLeft joined`
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

	render() {
		return(
			<div className="chat-room">
				<div className="header">
					<div className="room-code">Room: <span className="grey">{this.state.room_code}</span></div>
					<div className="username">Username: <span className="grey">{this.state.username}</span></div>
				</div>

				<ul className="messages">
					{this.state.messages.map( (messageData, i) => (
						<li
							key={i}
							className={messageData.className}
						>
							<span>{messageData.message}</span>
							<div className="sender">{messageData.username}</div>
						</li>
					))}
				</ul>
				<div className="user-typing">{this.state.usersTyping}</div>

				<div className="send-message">
					<Form.Control type="text" placeholder="Enter Message" value={this.state.messageToSend} onChange={this.onMessageChange}></Form.Control>
					<Button variant="success" onClick={this.sendMessage}>Send</Button>
				</div>
			</div>
		);
	}
}

export default ChatRoom;