import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom'; // Import useNavigate


function MessageList({ isTyping, messageContainerRef, messagesEndRef, selectedFriend, messages, setMessages, messagesPaginationPage, setMessagesPaginationPage }) { // Removed scrollToBottom prop
	const navigate = useNavigate(); // Get navigate function
	const [currentUserId, setCurrentUserId] = useState(null);

	const oldestMessageViewRef = useRef(null); // Ref for the element to observe
	const [isOldestMessageInView, setIsOldestMessageInView] = useState(false); // State to track visibility
	const observer = useRef(null); // Ref to store the observer instance

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
			if (!selectedFriend?.id) {
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
				const response = await fetch(`http://localhost:8080/messages?partner_id=${selectedFriend.id}&page=${messagesPaginationPage}&limit=10`, { // Added page=1
					method: 'GET',
					headers: {
						'Authorization': `Bearer ${token}`,
					},
				});

				if (response.ok) {
					const data = await response.json();
					// API returns newest first, reverse for display order (oldest first)
					// API returns newest first, which is what flex-col-reverse needs
					setMessages(Array.isArray(data) ? [...messages, ...data] : []);
					console.log("data fetched");

				} else if (response.status === 401) {
					toast.error("Please log in again.");
					localStorage.removeItem('authToken'); // Clear auth token
					localStorage.removeItem('userData'); // Clear user data
					setMessages([]);
					navigate('/'); // Redirect to login page
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
	}, [selectedFriend, messagesPaginationPage, setMessages]);

	// Callback for Intersection Observer
	const handleObserver = useCallback((entries) => {
		const target = entries[0];
		if (target.isIntersecting) {
			console.log("Oldest message marker is visible!");
			setIsOldestMessageInView(true);
			setTimeout(() => {
				setMessagesPaginationPage((prev) => (prev + 1));
				setIsOldestMessageInView(false);
			}, 1000);
			// Optional: Unobserve after first intersection if needed
			// if (observer.current && oldestMessageViewRef.current) {
			// 	observer.current.unobserve(oldestMessageViewRef.current);
			// }
		} else {
			// Optional: Set back to false if it scrolls out of view
			console.log("Oldest message marker is not visible!");
			// setIsOldestMessageInView(true);
		}
	}, [setMessagesPaginationPage]);

	// Effect to setup Intersection Observer
	useEffect(() => {
		// Ensure container ref is available
		if (!messageContainerRef.current) {
			console.warn("Message container ref not available for observer setup.");
			return;
		}

		const options = {
			root: messageContainerRef.current, // Use the scrollable container
			rootMargin: '0px',
			threshold: 1.0 // Trigger when 100% visible (adjust as needed)
		};

		// Disconnect previous observer if it exists
		if (observer.current) {
			observer.current.disconnect();
		}

		// Create and store the new observer
		observer.current = new IntersectionObserver(handleObserver, options);

		// Observe the target element if it exists
		if (oldestMessageViewRef.current) {
			observer.current.observe(oldestMessageViewRef.current);
		} else {
			console.warn("Oldest message view ref not available for observing.");
		}

		// Cleanup function
		return () => {
			if (observer.current) {
				observer.current.disconnect();
			}
		};
		// Dependencies: Re-run if container, target ref, or callback changes
	}, [messageContainerRef, oldestMessageViewRef, handleObserver]);



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
						<div className="  rounded-lg px-4 py-2 max-w-xs lg:max-w-md  text-white/90">
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

			{/* Target div for Intersection Observer */}
			<div ref={oldestMessageViewRef} style={{ height: '1px', width: '100%', flexShrink: 0 }} />

			{/* Example: Conditionally render based on visibility state */}
			{isOldestMessageInView && ( // Conditionally render based on isTyping state
				<div
					className="flex justify-center mb-3" // Aligned left

				>
					<div className=" px-4 py-2 max-w-xs lg:max-w-md text-white/90">
						<div className="flex space-x-1 items-center h-5">
							<span className="block h-4 w-1 rounded-full bg-gray-300 animate-spin" ></span>
						</div>
					</div>
				</div>
			)}

		</div >
	);
}

export default MessageList;