import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Props: messages, isTyping, messageContainerRef, messagesEndRef
function MessageList({ messages, isTyping, messageContainerRef, messagesEndRef }) {
	return (
		<div ref={messageContainerRef} className="relative flex-grow pl-9 pr-9 pt-8 overflow-y-auto"> {/* Added ref and relative positioning */}
			{/* Map over messages */}
			{messages.map((msg, index) => ( // Added index to map parameters
				<motion.div layout key={msg.id} className="mb-3"> {/* Moved margin bottom here */}
					{/* Message Bubble Container */}
					<div className={`flex ${msg.owner ? 'justify-end' : 'justify-start'}`}>
						<div className={` border border-gray-500/10 shadow rounded-lg px-4  py-2 max-w-xs lg:max-w-md ${msg.owner ? 'bg-blue-500/80 text-white' : 'bg-gray-600/30 text-white'}`}>
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
				</motion.div>
			))}
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
			{/* Empty div at the end of the list to scroll to */}
			<div ref={messagesEndRef} />
		</div>
	);
}

export default MessageList;