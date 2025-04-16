import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';


function MessageList({ isTyping, messageContainerRef, messagesEndRef, selectedFriend }) { // Removed scrollToBottom prop
	const [messages, setMessages] = useState([]); // State for fetched messages
	const [currentUserId, setCurrentUserId] = useState(null);

	// Get current user ID on mount
	useEffect(() => {
		try {
			const userDataString = localStorage.getItem('userData');
			if (userDataString) {
				const userData = JSON.parse(userDataString);
				setCurrentUserId(userData?.user_id);
			}
		} catch (e) {
			console.error("Failed to parse user data from localStorage", e);
		}
	}, []);

	// Fetch messages when selectedFriend changes
	useEffect(() => {
		const fetchMessages = async () => {
			if (!selectedFriend?.id || !currentUserId) {
				setMessages([]); // Clear messages if no friend selected or no current user ID
				return;
			}

			const token = localStorage.getItem('authToken');
			if (!token) {
				toast.error("Authentication token not found. Please log in.");
				setMessages([]);
				return;
			}

			try {
				const response = await fetch(`http://localhost:8080/messages?partner_id=${selectedFriend.id}&page=1&limit=10`, { // Added page=1
					method: 'GET',
					headers: {
						'Authorization': `Bearer ${token}`,
					},
				});

				if (response.ok) {
					const data = await response.json();
					// API returns newest first, reverse for display order (oldest first)
					// API returns newest first, which is what flex-col-reverse needs
					setMessages(Array.isArray(data) ? data : []); // Removed data.reverse()
				} else if (response.status === 401) {
					toast.error("Unauthorized. Please log in again.");
					// Optionally clear token and redirect to login here
					setMessages([]);
				} else {
					toast.error(`Failed to fetch messages: ${response.statusText}`);
					setMessages([]);
				}
			} catch (error) {
				console.error('Error fetching messages:', error);
				toast.error('Network error fetching messages.');
				setMessages([]);
			}

		};

		fetchMessages();
	}, [selectedFriend, currentUserId]); // Removed scrollToBottom from dependencies



	return (
		<div ref={messageContainerRef} className="relative flex flex-col-reverse flex-grow pl-9 pr-9 pt-8 overflow-y-auto"> {/* Added flex flex-col-reverse */}

			{/* Empty div at the end of the list to scroll to */}
			<div ref={messagesEndRef} />

			{/* Animated Typing Indicator */}
			<AnimatePresence>
				{isTyping && ( // Conditionally render based on isTyping state
					<motion.div
						className="flex justify-start mb-3" // Aligned left
						initial={{ opacity: 0, y: 10 }} // Start invisible and slightly down
						animate={{ opacity: 1, y: 0 }} // Fade in and slide up
						exit={{ opacity: 0, y: 10 }} // Fade out and slide down
						transition={{ duration: 0.3 }} // Animation duration
					>
						<div className=" border border-gray-500/10 rounded-lg px-4 py-2 max-w-xs lg:max-w-md bg-gray-600/30 text-white/90">
							<div className="flex space-x-1 items-center h-5"> {/* Container for dots */}
								<span className="block h-2 w-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0ms' }}></span>
								<span className="block h-2 w-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '150ms' }}></span>
								<span className="block h-2 w-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '300ms' }}></span>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Map over messages */}
			{messages.map((msg) => {
				const isOwner = msg.sender_id === currentUserId; // Determine ownership

				return (
					<motion.div layout key={msg.id} className="mb-3">
						{/* Message Bubble Container */}
						<div className={`flex ${isOwner ? 'justify-end' : 'justify-start'}`}>
							<div className={` flex-row border border-gray-500/10 shadow rounded-lg px-4 py-2 max-w-xs lg:max-w-md ${isOwner ? 'bg-blue-500/80 text-white' : 'bg-gray-600/30 text-white'}`}>
								{msg.content} {/* Use content from API */}
								{/* Optional Timestamp formatting can be added here later */}
							</div>
						</div>
					</motion.div>
				); // Ensure return is inside the map callback
			})}

		</div >
	);
}

export default MessageList;