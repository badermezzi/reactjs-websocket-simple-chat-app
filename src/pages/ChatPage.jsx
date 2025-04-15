import React, { useState, useEffect, useRef } from 'react';
import ChatHeader from '../Components/ChatHeader'; // Import the new header component
import Sidebar from '../Components/Sidebar'; // Import the new sidebar component
import ChatAreaHeader from '../Components/ChatAreaHeader'; // Import the new chat area header component
import MessageList from '../Components/MessageList'; // Import the new message list component
import MessageInput from '../Components/MessageInput'; // Import the new message input component
function ChatPage() {

	const [selectedFriend, setSelectedFriend] = useState(null)

	const [isTyping, setIsTyping] = useState(true); // Temp state for typing indicator visibility
	const [showScrollButton, setShowScrollButton] = useState(false);
	const [inputText, setInputText] = useState(""); // State for the message input
	const [showPicker, setShowPicker] = useState(false); // State for emoji picker visibility


	const messagesEndRef = useRef(null); // Ref for the bottom element (for scrolling to)
	const messageContainerRef = useRef(null); // Ref for the scrollable container itself

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); // Scroll function
	};

	useEffect(() => {
		scrollToBottom(); // Scroll down on initial render and when messages change
	}, []); // Empty dependency array means run only on mount

	// Effect to handle scroll event for showing/hiding the scroll button
	useEffect(() => {
		const container = messageContainerRef.current;

		const handleScroll = () => {
			if (container) {
				const { scrollTop, scrollHeight, clientHeight } = container;
				// Show button if scrolled up more than a certain threshold (e.g., 100px)
				setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100);
			}
		};

		container?.addEventListener('scroll', handleScroll);

		// Cleanup listener on component unmount
		return () => container?.removeEventListener('scroll', handleScroll);
	}, []); // Empty dependency array, listener attached once


	const onEmojiClick = (emojiObject) => {
		setInputText(prevInput => prevInput + emojiObject.emoji);
		// Optionally close picker after selection
		// setShowPicker(false);
	};

	// Dummy messages array
	const messages = [
		{ id: 1, message: "Hey, how are you?", owner: false, time: "10:01 AM" },
		{ id: 2, message: "I'm good, thanks! How about you?", owner: true, time: "10:02 AM" },
		{ id: 3, message: "Doing well. Just working on this chat app.", owner: false, time: "10:03 AM" },
		{ id: 4, message: "Nice! It's looking great.", owner: true, time: "10:03 AM" },
		{ id: 5, message: "Thanks! Still lots to do though.", owner: false, time: "10:04 AM" },
		{ id: 6, message: "Yeah, always more features to add.", owner: true, time: "10:05 AM" },
		{ id: 7, message: "Definitely. Like adding proper message rendering.", owner: false, time: "10:05 AM" },
		{ id: 8, message: "Haha, exactly!", owner: true, time: "10:06 AM" },
	];

	return (
		<div className='h-screen bg-[#11161C] flex flex-col'>
			<ChatHeader />
			<div className='flex flex-grow overflow-hidden'>
				<Sidebar selectedFriend={selectedFriend} setSelectedFriend={setSelectedFriend} />
				<div className='relative flex flex-col flex-grow bg-[#0D1216]/70 border border-gray-500/10 drop-shadow-black text-white rounded-2xl m-4 ml-2 mt-2 overflow-hidden'>
					<ChatAreaHeader selectedFriend={selectedFriend} setIsTyping={setIsTyping} />
					<MessageList
						messages={messages}
						isTyping={isTyping}
						messageContainerRef={messageContainerRef}
						messagesEndRef={messagesEndRef}
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
}

export default ChatPage;