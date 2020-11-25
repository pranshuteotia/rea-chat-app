import { Component } from 'react';

class Message extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		return(
			<li
				key={this.props.k}
				className={`animate__animated animate__faster message ${this.props.senderMessage? "animate__fadeInRight current-user" : "animate__fadeInLeft other-user"}`}
			>
				<span>{this.props.message}</span>
				<div className="sender">{this.props.username}</div>
			</li>
		);
	}
}

export default Message;