import React from 'react';
import EmojiPicker, { Theme } from 'emoji-picker-react';

// Props: inputText, setInputText, showPicker, setShowPicker, onEmojiClick
function MessageInput({ inputText, setInputText, showPicker, setShowPicker, onEmojiClick }) {

	// Handle form submission (placeholder for now)
	const handleSubmit = (e) => {
		e.preventDefault();
		console.log("Sending message:", inputText);
		setInputText(""); // Clear input after sending (example)
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