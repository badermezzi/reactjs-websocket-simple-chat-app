import React, { useState, useEffect, useRef, useCallback } from 'react';
import EmojiPicker, { Theme } from 'emoji-picker-react';

// Props: ws, recipientId, senderId, messages, setMessages, inputText, setInputText, showPicker, setShowPicker, onEmojiClick
function MessageInput({ ws, recipientId, senderId, setMessages, inputText, setInputText, showPicker, setShowPicker, onEmojiClick }) {

	const [isTypingSent, setIsTypingSent] = useState(false); // Track if typing_start was sent
	const typingStartTimerRef = useRef(null);
	const typingStopTimerRef = useRef(null);
	const prevInputTextRef = useRef(inputText); // Ref to track previous input value

	// const TYPING_TIMER_DELAY = 500; // Delay in ms for confirmation

	// Function to send typing indicators
	const sendTypingIndicator = useCallback((type) => {
		if (!ws || ws.readyState !== WebSocket.OPEN || !recipientId) {
			console.warn("Cannot send typing indicator: WS not ready or no recipient ID.");
			return;
		}
		try {
			const payload = { type, recipient_id: recipientId };
			ws.send(JSON.stringify(payload));
			console.log(`Sent ${type} indicator`);
		} catch (error) {
			console.error(`Failed to send ${type} indicator:`, error);
		}
	}, [recipientId, ws]);

	// Effect to handle typing indicator logic based on input changes
	useEffect(() => {
		const wasPreviouslyEmpty = !prevInputTextRef.current;
		const isCurrentlyEmpty = !inputText;

		// Clear existing timers on any input change
		clearTimeout(typingStartTimerRef.current);
		clearTimeout(typingStopTimerRef.current);

		if (wasPreviouslyEmpty && !isCurrentlyEmpty) {
			// Changed from empty to non-empty: Schedule typing_start check
			// typingStartTimerRef.current = setTimeout(() => {
			// 	// Check again after delay if input is still non-empty and start hasn't been sent
			// 	if (inputText && !isTypingSent) {
			// 		sendTypingIndicator('typing_start');
			// 		setIsTypingSent(true);
			// 	}
			// }, TYPING_TIMER_DELAY);

			if (inputText && !isTypingSent) {
				sendTypingIndicator('typing_start');
				setIsTypingSent(true);
			}

		} else if (!wasPreviouslyEmpty && isCurrentlyEmpty) {
			// Changed from non-empty to empty: Schedule typing_stop check
			// typingStopTimerRef.current = setTimeout(() => {
			// 	// Check again after delay if input is still empty and start *was* sent
			// 	if (!inputText && isTypingSent) {
			// 		sendTypingIndicator('typing_stop');
			// 		setIsTypingSent(false);
			// 	}
			// }, TYPING_TIMER_DELAY);

			if (!inputText && isTypingSent) {
				sendTypingIndicator('typing_stop');
				setIsTypingSent(false);
			}
		}

		// Update previous input ref for the next render
		prevInputTextRef.current = inputText;

		// Cleanup timers on component unmount or if dependencies change drastically (though only inputText here)
		return () => {
			// clearTimeout(typingStartTimerRef.current);
			// clearTimeout(typingStopTimerRef.current);
		};
	}, [inputText, isTypingSent, recipientId, ws, sendTypingIndicator]); // Dependencies for the effect


	// Handle form submission
	const handleSubmit = (e) => {
		e.preventDefault();
		const trimmedInput = inputText.trim();

		// 1. Validate input
		if (!trimmedInput) {
			console.log("Message input is empty. Not sending.");
			return; // Don't send empty messages
		}

		// 2. Validate WebSocket connection
		if (!ws || ws.readyState !== WebSocket.OPEN) {
			console.error("WebSocket is not connected or not ready.");
			// Optionally, add user feedback here (e.g., a toast notification)
			return;
		}

		// 3. Validate recipient ID (basic check)
		if (!recipientId || typeof recipientId !== 'number' || recipientId <= 0) {
			console.error("Invalid or missing recipient ID:", recipientId);
			// Optionally, add user feedback
			return;
		}

		// 4. Construct the message payload
		const messagePayload = {
			type: "private_message",
			recipient_id: recipientId,
			content: trimmedInput
		};

		// 5. Send the message
		try {

			sendTypingIndicator('typing_stop');
			setIsTypingSent(false);

			ws.send(JSON.stringify(messagePayload));
			console.log("Sent message:", messagePayload);




			// --- Typing Indicator Stop on Send ---
			// Clear any pending timers immediately
			clearTimeout(typingStartTimerRef.current);
			clearTimeout(typingStopTimerRef.current);
			// If typing_start was sent, send typing_stop now
			if (isTypingSent) {
				sendTypingIndicator('typing_stop');
				setIsTypingSent(false);
			}
			// ------------------------------------

			// Add the sent message to the sender's UI immediately
			const sentMessageForState = {
				id: Date.now(), // Placeholder ID for UI purposes
				sender_id: senderId, // Use the passed senderId
				receiver_id: recipientId, // Include recipient ID for context if needed later
				content: trimmedInput,
				created_at: new Date().toISOString() // Placeholder timestamp
			};



			// Prepend the new message to the existing messages array
			setMessages(prevMessages => [sentMessageForState, ...prevMessages]);


			setInputText(""); // Clear input after sending
			// Optionally close emoji picker if open
			// setShowPicker(false);
		} catch (error) {
			console.error("Failed to send message via WebSocket:", error);
			// Optionally, add user feedback about the failure
		}
	};

	return (
		<div className="relative flex items-end flex-shrink-0 p-4 mt-1 border-t border-gray-700/20"> {/* Added relative for picker positioning */}
			{/* Message Input Form */}
			<form onSubmit={handleSubmit} className="flex items-end w-full space-x-3 "> {/* Changed items-center to items-end */}
				{/* Emoji Button */}
				<button
					type="button"
					onClick={() => setShowPicker(val => !val)} // Toggle picker visibility
					className="p-2 mb-2 rounded-full text-gray-400 hover:text-gray-200 hover:bg-gray-700 flex-shrink-0"
					aria-label="Add emoji"
				>
					{/* Emoji Icon SVG */}
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
						<path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm+4.5 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Z" />
					</svg>
				</button>
				<textarea
					rows="2" // Start with one row - auto-resize logic needed later
					placeholder="Type a message..."
					className="flex-grow bg-gray-700/30 border border-gray-600/50 py-2 px-4 resize-none overflow-hidden hover:bg-gray-800 focus:bg-gray-800 rounded-md text-sm focus:outline-none placeholder-gray-400 shadow"
					value={inputText} // Bind value to state
					onChange={(e) => setInputText(e.target.value)} // Update state on change
					onKeyDown={(e) => {
						// Submit on Enter press without Shift
						if (e.key === 'Enter' && !e.shiftKey) {
							e.preventDefault(); // Prevent newline
							handleSubmit(e); // Trigger form submission
						}
					}}
					style={{ maxHeight: '100px' }} // Optional: Limit max height
				// Add onInput handler later for auto-resizing
				/>
				<button
					type="submit" // Use type="submit" for form submission
					className="p-2 mb-2 rounded-full bg-blue-600/90 hover:bg-blue-500 text-white flex-shrink-0 cursor-pointer"
				>
					{/* Placeholder SVG for Send Icon */}
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.4} stroke="currentColor" className="w-7 h-7">
						<path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
					</svg>
				</button>
			</form>
			{/* Emoji Picker */}
			{showPicker && (
				<div className="absolute bottom-20 left-4 z-30"> {/* Position picker */}
					<EmojiPicker
						onEmojiClick={onEmojiClick}
						theme={Theme.DARK} // Use dark theme
						lazyLoadEmojis={true}
						height={400}
						width={350}
					/>
				</div>
			)}
		</div>
	);
}

export default MessageInput;