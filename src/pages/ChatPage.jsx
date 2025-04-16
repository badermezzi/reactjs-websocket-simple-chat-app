import React, { useState, useEffect, useRef } from 'react';
import ChatHeader from '../Components/ChatHeader'; // Import the new header component
import Sidebar from '../Components/Sidebar'; // Import the new sidebar component
import ChatAreaHeader from '../Components/ChatAreaHeader'; // Import the new chat area header component
import MessageList from '../Components/MessageList'; // Import the new message list component
import MessageInput from '../Components/MessageInput'; // Import the new message input component
function ChatPage() {

	const [selectedFriend, setSelectedFriend] = useState({})

	const [isTyping, setIsTyping] = useState(true); // Temp state for typing indicator visibility
	const [showScrollButton, setShowScrollButton] = useState(false);
	const [inputText, setInputText] = useState(""); // State for the message input
	const [showPicker, setShowPicker] = useState(false); // State for emoji picker visibility


	const messagesEndRef = useRef(null); // Ref for the bottom element (for scrolling to)
	const messageContainerRef = useRef(null); // Ref for the scrollable container itself
	const ws = useRef(null); // Ref to hold the WebSocket instance

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};


	// Effect to handle scroll event for showing/hiding the scroll button
	useEffect(() => {
		const container = messageContainerRef.current;

		const handleScroll = () => {
			if (container) {
				const { scrollTop } = container;
				// With flex-col-reverse, scrollTop is 0 at bottom, negative when scrolled up.
				setShowScrollButton(scrollTop < -100); // Show button if scrolled up significantly (adjust threshold if needed)
			}
		};
		container?.addEventListener('scroll', handleScroll);

		// Cleanup listener on component unmount
		return () => container?.removeEventListener('scroll', handleScroll);
	}, []); // Empty dependency array, listener attached once

	// Effect to establish WebSocket connection
	useEffect(() => {
		const token = localStorage.getItem('authToken');
		if (!token) {
			console.error('WebSocket: No auth token found.');
			// Optionally redirect to login
			return;
		}

		// Replace with your actual WebSocket server address
		const wsUrl = `ws://localhost:8080/ws?token=${token}`; // Assuming ws, adjust if wss

		ws.current = new WebSocket(wsUrl);

		ws.current.onopen = () => {
			console.log('WebSocket Connected');
			// You might want to send a ping or initial message here
		};

		ws.current.onclose = (event) => {
			console.log('WebSocket Disconnected:', event.reason, event.code);
			// Implement reconnection logic if needed
		};

		ws.current.onerror = (error) => {
			console.error('WebSocket Error:', error);
		};

		ws.current.onmessage = (event) => {
			console.log('WebSocket Message:', event.data);
			// TODO: Handle incoming messages (e.g., parse JSON, update message list)
			// const message = JSON.parse(event.data);
			// Add message to state, potentially check if it belongs to the selectedFriend
		};

		// Cleanup function to close WebSocket on component unmount
		return () => {
			console.log('Closing WebSocket');
			ws.current?.close();
		};
	}, []); // Empty dependency array ensures this runs only once on mount


	const onEmojiClick = (emojiObject) => {
		setInputText(prevInput => prevInput + emojiObject.emoji);
		// Optionally close picker after selection
		// setShowPicker(false);
	};



	return (
		<div className='h-screen bg-[#11161C] flex flex-col'>
			<ChatHeader />
			<div className='flex flex-grow overflow-hidden'>
				<Sidebar selectedFriend={selectedFriend} setSelectedFriend={setSelectedFriend} />
				<div className='relative flex flex-col flex-grow bg-[#0D1216]/70 border border-gray-500/10 drop-shadow-black text-white rounded-2xl m-4 ml-2 mt-2 overflow-hidden'>
					<ChatAreaHeader selectedFriend={selectedFriend} setIsTyping={setIsTyping} />
					<MessageList
						isTyping={isTyping}
						messageContainerRef={messageContainerRef}
						messagesEndRef={messagesEndRef}
						selectedFriend={selectedFriend}
						scrollToBottom={scrollToBottom} // Pass scroll function down
					/>
					<MessageInput
						inputText={inputText}
						setInputText={setInputText}
						showPicker={showPicker}
						setShowPicker={setShowPicker}
						onEmojiClick={onEmojiClick}
					/>
					{showScrollButton && (
						<button
							onClick={scrollToBottom}
							className="absolute bottom-24 left-1/2 -translate-x-1/2 p-2 rounded-full bg-blue-600/80 hover:bg-blue-500 text-white animate-bounce cursor-pointer z-20" // Added z-20
							aria-label="Scroll to bottom"
						>
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
								<path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
							</svg>
						</button>
					)}
				</div>
			</div>
		</div >
	);
};

export default ChatPage;