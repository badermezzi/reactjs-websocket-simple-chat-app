import React, { useState, useEffect, useRef } from 'react'; // Import useEffect and useRef
import Logo from '../assets/0a411daf-7cc4-4531-8484-9a26a0ad8eeb-removebg-preview.png'; // Import the logo

function ChatPage() {
	const [online, setOnline] = useState(true);
	const [showScrollButton, setShowScrollButton] = useState(false); // State for button visibility


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
		<div className='h-screen bg-[#11161C] flex flex-col'> {/* Make parent a flex column */}
			{/* Header Div */}
			<div className='h-18  text-white flex items-center justify-between px-5'> {/* Changed justify-end to justify-between */}
				{/* Logo */}
				<img src={Logo} alt="Logo" className="h-30" /> {/* Adjust height as needed */}

				{/* Right side content (Button + Avatar) */}
				<div className="flex items-center"> {/* Wrapper for right side items */}
					{/* Avatar container */}
					{/* Button and Indicator Container */}
					<div className="relative mr-4"> {/* Added relative positioning and margin */}
						<button onClick={() => (setOnline((online) => (!online)))} className="bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium py-2 px-3 rounded-md cursor-pointer">
							{online ? "Go Offline" : "Go Online"}
							{/* {online ? "Online" : "Offline"} */}
						</button>
						{/* Online Indicator - Positioned relative to the container */}
						<span className="absolute top-0 right-0 flex h-3 w-3 -translate-y-1/2 translate-x-1/2"> {/* Position top-right with offset */}
							{online ? <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span> : <span></span>}
							<span className={`relative inline-flex h-3 w-3 rounded-full bg-${online ? "green" : "red"}-600`}></span>
						</span>
					</div>

					{/* Avatar container */}
					<div className="relative"> {/* Keep relative for potential future use */}
						<img
							src="https://i.pravatar.cc/150?img=27" // Using placehold.co
							alt="User Avatar"
							className="h-13 w-13 rounded-full drop-shadow-black border border-gray-400/50 cursor-pointer  hover:opacity-85" // Adjust size (h-10 w-10) as needed
						/>
						{/* Indicator removed from here */}
					</div>
					{/* Other header content can go here */}
				</div>
			</div>
			{/* Content Div */}
			{/* Content Area (Sidebar + Main) */}
			<div className='flex flex-grow overflow-hidden'> {/* Make this a flex row and allow content to grow, hide overflow */}
				{/* Sidebar */}
				<div className='w-75 bg-[#0D1216]/70 border border-gray-500/10 drop-shadow-black text-white p-5 flex flex-col flex-shrink-0 rounded-2xl m-4 mr-2 mt-2'> {/* Added flex flex-col */}
					{/* Title */}
					<h2 className="text-2xl font-semibold mb-4 ">Friends List</h2>

					{/* Search Input */}
					<div className="relative mb-4">
						<input
							type="text"
							placeholder="Search"
							className="w-full bg-gray-700/30 hover:bg-gray-800 focus:bg-gray-800 border border-gray-600/50 rounded-md py-2 px-3 pl-8 text-sm focus:outline-none placeholder-gray-400 shadow"

						/>
						{/* Placeholder for search icon */}
						<svg className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
						</svg>
					</div>

					{/* Friends List (Placeholder) */}
					<ul className="flex-grow overflow-y-auto"> {/* Allow list to scroll */}
						{[1, 2, 3, 4, 5].map((item) => (
							<li key={item} className="mb-2 my-0 ">
								{/* Friend Item Structure */}
								<div className={`flex items-center p-2 rounded-xl ${item === 1 ? "" : "hover:"}bg-gray-700/50  cursor-pointer`}>
									{/* Left Block: Avatar */}
									<img
										src={`https://i.pravatar.cc/150?img=${item + 10}`} // Placeholder avatar
										alt="Friend Avatar"
										className="h-10 w-10 rounded-full flex-shrink-0"
									/>

									{/* Middle Block: Name & Message */}
									<div className="flex-grow px-3 overflow-hidden"> {/* Allow grow, add padding, hide overflow */}
										<div className="font-semibold text-sm">Friend Name {item}</div>
										{/* item === item condition if message not seen for later, logic with the backend */}
										{item === item ? <div className="text-xs text-gray-400 truncate">
											This is the last message placeholder...
										</div> : <div></div>}
										{/* Truncate long messages */}
									</div>

									{/* Right Block: Status Indicator */}
									<div className="flex-shrink-0">
										{/* Simple online dot - replace with logic later */}
										{item === 1 && <span className="block h-2.5 w-2.5 rounded-full bg-green-500"></span>}
									</div>
								</div>
							</li>
						))}
					</ul>
				</div>
				{/* Main Chat Area */}
				<div className='relative flex flex-col flex-grow bg-[#0D1216]/70 border border-gray-500/10 drop-shadow-black text-white rounded-2xl m-4 ml-2 mt-2 overflow-hidden'> {/* Added relative */}
					{/* Top Block (Chat Header) */}
					<div className="h-18 flex items-center justify-between flex-shrink-0 p-5 border-b border-gray-700/20"> {/* Added flex, items-center, justify-between */}
						{/* Left Side: Avatar + User Info */}
						<div className="flex items-center">
							<img
								src="https://i.pravatar.cc/150?img=11" // Placeholder avatar
								alt="Chat Partner Avatar"
								className="h-10 w-10 rounded-full mr-3"
							/>
							<div>
								<div className="font-bold text-lg">Chat Partner Name</div>
								<div className="text-xs font-bold text-green-500">Online</div> {/* Status */}
							</div>
						</div>

						{/* Right Side: Call Buttons */}
						<div className="flex items-center space-x-3"> {/* Buttons group */}
							{/* Voice Call Button */}
							<button className="p-2 rounded-full bg-green-500/90 hover:bg-green-600 text-white cursor-pointer">
								{/* Placeholder SVG for Voice Call */}
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
									<path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
								</svg>
							</button>
							{/* Video Call Button */}
							<button className="p-2 rounded-full bg-blue-500/90 hover:bg-blue-600 text-white cursor-pointer">
								{/* Placeholder SVG for Video Call */}
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
									<path strokeLinecap="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
								</svg>
							</button>
							{/* Settings Button */}
							<button className="p-2 rounded-full bg-gray-700/50 hover:bg-gray-600/60 text-white/90 cursor-pointer">
								{/* Placeholder SVG for Vertical Ellipsis */}
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
									<path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
								</svg>
							</button>
						</div>
					</div>

					{/* Middle Block (Messages) */}
					<div ref={messageContainerRef} className="relative flex-grow pl-9 pr-9 pt-8 overflow-y-auto"> {/* Added ref and relative positioning */}
						{/* Map over messages */}
						{messages.map((msg, index) => ( // Added index to map parameters
							<div key={msg.id} className="mb-3"> {/* Moved margin bottom here */}
								{/* Message Bubble Container */}
								<div className={`flex ${msg.owner ? 'justify-end' : 'justify-start'}`}>
									<div className={`rounded-lg px-4 py-2 max-w-xs lg:max-w-md ${msg.owner ? 'bg-blue-600/60 text-white/90' : 'bg-gray-600/60 text-white/90'}`}>
										{msg.message}
										{/* Timestamp */}
										<div className={`text-xs mt-1 ${msg.owner ? 'text-blue-200/70' : 'text-gray-400/70'} text-right font-bold`}>
											{msg.time}
										</div>
									</div>
								</div>
								{/* Seen Indicator - Conditionally render only after the last owned message */}
								{msg.owner && index === messages.length - 1 && (
									<div className="text-xs text-gray-400 text-right mt-1 pr-1"> {/* Align with owner message */}
										Seen 2m ago {/* Placeholder time */}
									</div>
								)}
							</div>
						))}
						{/* Placeholder Typing Indicator - Conditionally render later */}
						<div className="flex justify-start mb-3"> {/* Aligned left */}
							<div className="rounded-lg px-4 py-2 max-w-xs lg:max-w-md bg-gray-600/60 text-white/90">
								<div className="flex space-x-1 items-center h-5"> {/* Container for dots */}
									<span className="block h-2 w-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0ms' }}></span>
									<span className="block h-2 w-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '150ms' }}></span>
									<span className="block h-2 w-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '300ms' }}></span>
								</div>
							</div>
						</div>
						{/* Empty div at the end of the list to scroll to */}
						<div ref={messagesEndRef} />

					</div>

					{/* Bottom Block (Input) */}
					<div className="flex items-end flex-shrink-0 p-4 mt-1 border-t border-gray-700/20"> {/* Removed h-20, changed items-center to items-end */}
						{/* Message Input Form */}
						<form className="flex items-center w-full space-x-3 ">
							<textarea
								rows="2" // Start with one row
								placeholder="Type a message..."
								className="flex-grow bg-gray-700/30 border border-gray-600/50  py-2 px-4   resize-none overflow-hidden hover:bg-gray-800 focus:bg-gray-800   rounded-md    text-sm focus:outline-none placeholder-gray-400 shadow" // Added resize-none, overflow-hidden

								style={{ maxHeight: '100px' }} // Optional: Limit max height
							// Add onInput handler later for auto-resizing
							/>
							<button
								type="submit" // Use type="submit" for form submission
								className="p-2 rounded-full bg-blue-600/90 hover:bg-blue-500 text-white flex-shrink-0 cursor-pointer"
							>
								{/* Placeholder SVG for Send Icon */}
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.4} stroke="currentColor" className="w-7 h-7">
									<path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
								</svg>
							</button>
						</form>
					</div>
					{/* Scroll to Bottom Button - Conditionally Rendered & Repositioned */}
					{showScrollButton && (
						<button
							onClick={scrollToBottom}
							className="absolute bottom-24 left-1/2 -translate-x-1/2 p-2 rounded-full bg-blue-600/80 hover:bg-blue-500 text-white animate-bounce cursor-pointer z-20" // Added z-20
							aria-label="Scroll to bottom"
						>
							{/* Down Arrow SVG */}
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