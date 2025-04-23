import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Import framer-motion
import ChatHeader from '../Components/ChatHeader'; // Import the new header component
import Sidebar from '../Components/Sidebar'; // Import the new sidebar component
import ChatAreaHeader from '../Components/ChatAreaHeader'; // Import the new chat area header component
import MessageList from '../Components/MessageList'; // Import the new message list component
import MessageInput from '../Components/MessageInput'; // Import the new message input component
import IncomingCallBar from '../Components/IncomingCallBar'; // Import the new incoming call bar component
import useWebRTC from '../webRTC utils/useWebRTC';
import { base64Sound } from '../utils/sound';

function ChatPage() {

	const audioRef = useRef(new Audio(base64Sound));



	const updatingSelectedFriendStatusRef = useRef(false);

	// Retrieve user data from localStorage
	const storedUserData = localStorage.getItem('userData');
	const currentUser = storedUserData ? JSON.parse(storedUserData) : null;
	const currentUserId = currentUser?.user_id; // Assuming the ID is stored as 'id'

	const [messages, setMessages] = useState([]);
	const [messagesPaginationPage, setMessagesPaginationPage] = useState(0);

	const [selectedFriend, setSelectedFriend] = useState(null);


	const [onlineUsers, setOnlineUsers] = useState([]); // State for online users
	const [offlineUsers, setOfflineUsers] = useState([]); // State for offline users
	const [displayedUsers, setDisplayedUsers] = useState([]); // Combined list for UI
	const selectedFriendRef = useRef({});

	useEffect(() => {
		selectedFriendRef.current = selectedFriend
	}, [selectedFriend]);

	const [isTyping, setIsTyping] = useState(false); // Temp state for typing indicator visibility
	const [showScrollButton, setShowScrollButton] = useState(false);
	const [inputText, setInputText] = useState(""); // State for the message input
	const [showPicker, setShowPicker] = useState(false); // State for emoji picker visibility
	const [showIncomingCall, setShowIncomingCall] = useState(true); // State to show/hide incoming call bar (true for testing)


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


	// Effect to fetch initial user lists and ringing audio
	useEffect(() => {
		const fetchUsers = async () => {
			// Fetch Online Users
			try {
				const onlineResponse = await fetch('http://localhost:8080/users/online');
				if (onlineResponse.ok) {
					const onlineData = await onlineResponse.json();
					setOnlineUsers(onlineData.online_users || []);
					console.log('Fetched online users:', onlineData.online_users);
				} else {
					console.error('Failed to fetch online users:', onlineResponse.statusText);
				}
			} catch (error) {
				console.error('Error fetching online users:', error);
			}

			// Fetch Offline Users
			try {
				const offlineResponse = await fetch('http://localhost:8080/users/offline');
				if (offlineResponse.ok) {
					const offlineData = await offlineResponse.json();
					setOfflineUsers(offlineData.offline_users || []);
					console.log('Fetched offline users:', offlineData.offline_users);
				} else {
					console.error('Failed to fetch offline users:', offlineResponse.statusText);
				}
			} catch (error) {
				console.error('Error fetching offline users:', error);
			}
		};

		const audio = audioRef.current;

		fetchUsers(); // Call the user fetch function



		// Cleanup function
		return () => {
			audio.loop = false;
		};
	}, []); // Empty dependency array means this runs once on mount

	// Effect to combine and filter users when onlineUsers or offlineUsers change
	useEffect(() => {
		let currentUserId = null;
		try {
			const userDataString = localStorage.getItem('userData');
			if (userDataString) {
				const userData = JSON.parse(userDataString);
				currentUserId = userData?.user_id; // Get logged-in user's ID
			}
		} catch (e) {
			console.error("Failed to parse user data from localStorage", e);
		}

		const onlineWithStatus = onlineUsers.map(u => ({ ...u, isOnline: true }));
		const offlineWithStatus = offlineUsers.map(u => ({ ...u, isOnline: false }));

		// Combine users
		const combinedUsers = [...onlineWithStatus, ...offlineWithStatus];

		// Filter out the current user if their ID was found
		const filteredUsers = currentUserId
			? combinedUsers.filter(user => user.id !== currentUserId)
			: combinedUsers;

		setDisplayedUsers(filteredUsers);

	}, [onlineUsers, offlineUsers]); // Re-run when fetched data changes



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
			console.log('WebSocket Message Received:', event.data);
			try {
				const message = JSON.parse(event.data);

				// Check message type
				if (message.type === 'incoming_message') {
					// Format the message according to the required state structure
					const newMessage = {
						id: Date.now(), // Placeholder ID
						sender_id: message.sender_id,
						// receiver_id: null, // Omitting as requested for now
						content: message.content,
						created_at: new Date().toISOString() // Placeholder timestamp
					};

					// Add the new message to the state
					// We add it to the end because new messages appear at the bottom

					setMessages(prevMessages => [newMessage, ...prevMessages]);

					// Optional: Scroll to bottom only if the message is from/to the selected friend
					// This check prevents scrolling if a message arrives for a different chat
					// if (message.sender_id === selectedFriend?.id /* || check if current user sent it */ ) {
					//  scrollToBottom(); // Consider calling this conditionally or in a useEffect hook watching messages
					// }
					// For simplicity now, let's scroll unconditionally, but be aware of the above point.
					// Calling scrollToBottom directly might sometimes race with the render.
					// A useEffect watching `messages` might be more robust.
					// setTimeout(scrollToBottom, 0); // A common workaround for scroll timing issues

				} else if (message.type === 'typing_start') {
					// Check if the typing is from the selected friend
					if (+message.sender_id === +selectedFriendRef.current.id) {
						console.log(`Friend ${selectedFriendRef.current.id} started typing.`);
						setIsTyping(true);
					}
				} else if (message.type === 'typing_stop') {
					// Check if the typing stop is from the selected friend
					if (message.sender_id === selectedFriendRef.current.id) {
						console.log(`Friend ${selectedFriendRef.current.id} stopped typing.`);
						setIsTyping(false);
					}
				} else if (message.type === 'user_online') {
					// Handle user online status

					updatingSelectedFriendStatusRef.current = true

					if (selectedFriendRef.current?.id === message?.userId) {
						setSelectedFriend(selectedFriend => ({ ...selectedFriend, isOnline: true }));
					}

					setDisplayedUsers(prevUsers =>
						prevUsers.map(user =>
							user.id === message.userId ? { ...user, isOnline: true } : user
						)
					);
				} else if (message.type === 'user_offline') {
					// Handle user offline status

					updatingSelectedFriendStatusRef.current = true

					if (selectedFriendRef.current?.id === message?.userId) {
						setSelectedFriend(selectedFriend => ({ ...selectedFriend, isOnline: false }));
					}


					setDisplayedUsers(prevUsers =>
						prevUsers.map(user =>
							user.id === message.userId ? { ...user, isOnline: false } : user
						)
					);

				} else {
					console.log("Received unhandled message type:", message.type);
				}
			} catch (error) {
				console.error('Failed to parse incoming WebSocket message or process it:', error);
			}
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


	/////////////////////////// -- webRTC -- ////////////////////////////

	// => callee 'calling' 

	const [isCalling, setIsCalling] = useState(false);
	const [preparingCall, setPreparingCall] = useState(false);

	const calleeIdRef = useRef(null);

	// Function to play the sound
	const playSound = useCallback(() => { // Using useCallback for potential optimization
		const audio = audioRef.current;
		audio.loop = true;
		const playPromise = audio.play();

		if (playPromise !== undefined) {
			playPromise.catch(error => {
				console.error("Audio play failed:", error);
				// Auto-play was prevented. You might need to guide the user
				// to interact with the page first (e.g., click a button).
			});
		}
	}, []); // Dependency array includes audio instance

	const stopSound = useCallback(() => {
		const audio = audioRef.current;
		audio.loop = false;
		audio.pause();
		audio.currentTime = 0; // Reset time to the beginning
	}, []); // Depends on the same audio object

	const config = {
		iceServers: [
			{ urls: 'stun:stun.l.google.com:19302' }
		]
	};

	const {
		// State
		remoteStream,
		connectionState,
		callState,
		isAudioMuted,
		isVideoMuted,
		error,
		// Actions
		initiateCall,
		answerCall,
		hangUp,
		toggleAudioMute,
		toggleVideoMute,
	} = useWebRTC(ws.current, currentUserId, config); // Pass the ref object itself

	// Ref to store previous state values for comparison
	const prevStateRef = useRef({
		remoteStream,
		connectionState,
		callState,
		isAudioMuted,
		isVideoMuted,
		error,
	});

	const isInitialMountRef = useRef(true); // Ref to track initial mount

	// Effect to log specific state changes from useWebRTC
	useEffect(() => {
		if (isInitialMountRef.current) {
			// On initial mount, log all current states
			console.log('WebRTC Initial State:', {
				remoteStream,
				connectionState,
				callState,
				isAudioMuted,
				isVideoMuted,
				error,
			});
			isInitialMountRef.current = false; // Set to false after first run
		} else {
			// On subsequent renders, compare and log only changes
			const previousState = prevStateRef.current;

			if (previousState.remoteStream !== remoteStream) {
				console.log('WebRTC Update: remoteStream changed:', remoteStream);
			}
			if (previousState.connectionState !== connectionState) {
				console.log('WebRTC Update: connectionState changed:', connectionState);
			}
			if (previousState.callState !== callState) {
				console.log('WebRTC Update: callState changed:', callState);

				if (callState === "calling") {
					console.log("calling...");
					setPreparingCall(false);
					setIsCalling(true);
					// Play ringing sound
					console.log('Attempting to play audio///////////');
					playSound();
				};

			}
			if (previousState.isAudioMuted !== isAudioMuted) {
				console.log('WebRTC Update: isAudioMuted changed:', isAudioMuted);
			}
			if (previousState.isVideoMuted !== isVideoMuted) {
				console.log('WebRTC Update: isVideoMuted changed:', isVideoMuted);
			}
			// Use JSON stringify for error comparison as error objects might change reference
			if (JSON.stringify(previousState.error) !== JSON.stringify(error)) {
				console.error('WebRTC Update: error changed:', error);
			}
		}

		// Always update the ref with the current values for the next comparison
		prevStateRef.current = {
			remoteStream,
			connectionState,
			callState,
			isAudioMuted,
			isVideoMuted,
			error,
		};
	}, [remoteStream, connectionState, callState, isAudioMuted, isVideoMuted, error]);


	function hangupHandler() {
		hangUp();
		calleeIdRef.current = null;
		setIsCalling(false);
		// Stop ringing sound
		stopSound();

	}

	/////////////////////////////////////////////////////////////////////


	return (
		<div className='h-screen bg-[#11161C] flex flex-col'>
			{/* CallingBar with Animation */}
			<AnimatePresence>
				{isCalling && calleeIdRef.current !== selectedFriend?.id && (
					<motion.div
						initial={{ opacity: 0, y: -50 }} // Start hidden above
						animate={{ opacity: 1, y: 0 }}    // Animate to visible at original position
						exit={{ opacity: 0, y: -50 }}     // Animate out by sliding up
						transition={{ duration: 0.3 }}   // Animation duration
						// Apply the same absolute positioning wrapper logic here
						className="absolute top-0 left-1/2 -translate-x-1/2 z-50 w-65" // Keep positioning logic on the motion div
					>
						<div className=" absolute top-0 left-1/2 -translate-x-1/2 w-55 h-16 mt-2 bg-[#0D1216]/70 z-50 text-white p-2 px-4 rounded-2xl shadow-lg border border-gray-500/10 flex items-center justify-between">
							<p className="p-2  mx-3  text-green-500/90 animate-pulse ">
								Calling...
							</p>

							<button
								onClick={hangupHandler}
								className="p-[6px]  rounded-full bg-red-600/90  hover:bg-red-700 border border-gray-500/20 text-white cursor-pointer flex-shrink-0 "
								aria-label="Hang up call"
							>
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 rotate-135">
									<path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
								</svg>
							</button>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
			{/* IncomingCallBar with Animation */}
			{/* <AnimatePresence>
				{showIncomingCall && (
					<motion.div
						initial={{ opacity: 0, y: -50 }} // Start hidden above
						animate={{ opacity: 1, y: 0 }}    // Animate to visible at original position
						exit={{ opacity: 0, y: -50 }}     // Animate out by sliding up
						transition={{ duration: 0.3 }}   // Animation duration
						// Apply the same absolute positioning wrapper logic here
						className="absolute top-0 left-1/2 -translate-x-1/2 z-50 w-65" // Keep positioning logic on the motion div
					>
						<IncomingCallBar
							callerUsername="Olivia" // Placeholder
							callerAvatarUrl="https://i.pravatar.cc/150?img=38" // Placeholder - Note: User changed this from 27
							onHangup={() => { console.log("Hangup clicked"); setShowIncomingCall(false); }} // Placeholder action
							onAnswer={() => { console.log("Answer clicked"); setShowIncomingCall(false); }} // Placeholder action
						/>
					</motion.div>
				)}
			</AnimatePresence> */}
			<ChatHeader currentUser={currentUser} />
			<div className='flex flex-grow overflow-hidden'>

				<Sidebar
					calleeIdRef={calleeIdRef}
					isCalling={isCalling}
					setMessagesPaginationPage={setMessagesPaginationPage}

					messages={messages}
					setMessages={setMessages}
					selectedFriend={selectedFriend}
					setSelectedFriend={setSelectedFriend}
					displayedUsers={displayedUsers} // Pass displayedUsers down
				/>

				{selectedFriend ? <div className='relative flex flex-col flex-grow bg-[#0D1216]/70 border border-gray-500/10 drop-shadow-black text-white rounded-2xl m-4 ml-2 mt-2 overflow-hidden'>
					<ChatAreaHeader hangupHandler={hangupHandler} calleeIdRef={calleeIdRef} hangUp={hangUp} preparingCall={preparingCall} setPreparingCall={setPreparingCall} isCalling={isCalling} setIsCalling={setIsCalling} initiateCall={initiateCall} ws={ws} senderId={currentUserId} selectedFriend={selectedFriend} setSelectedFriend={setSelectedFriend} />
					<MessageList
						messagesPaginationPage={messagesPaginationPage}
						setMessagesPaginationPage={setMessagesPaginationPage}

						updatingSelectedFriendStatusRef={updatingSelectedFriendStatusRef}

						messages={messages}
						setMessages={setMessages}

						isTyping={isTyping}
						messageContainerRef={messageContainerRef}
						messagesEndRef={messagesEndRef}
						selectedFriend={selectedFriend}
						scrollToBottom={scrollToBottom} // Pass scroll function down
					/>
					<MessageInput
						setMessages={setMessages} // Pass the setter function
						senderId={currentUserId} // Pass the sender's ID
						ws={ws.current} // Pass the WebSocket instance
						recipientId={selectedFriend?.id} // Pass the selected friend's ID
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
					: <div className='relative flex flex-col flex-grow bg-[#0D1216]/70 border border-gray-500/10 drop-shadow-black text-white rounded-2xl m-4 ml-2 mt-2 overflow-hidden'>

					</div>
				}
			</div>
		</div >
	);
};

export default ChatPage;