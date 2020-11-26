function Message(props) {
	return(
		<li
			key={props.idx}
			className={props.className}
		>
			<span>{props.message}</span>
			<div className="sender">{props.username}</div>
		</li>
	);
}

export default Message;