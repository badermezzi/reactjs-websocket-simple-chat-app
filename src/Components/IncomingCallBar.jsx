import React from 'react';

// Placeholder icons - ideally, import these properly or use an icon library
const HangupIcon = () => (
	<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-5 rotate-135">
		<path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
	</svg>
);

const AnswerIcon = () => (
	<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-5">
		<path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
	</svg>
);

const VideoAnswerIcon = () => (
	<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-5">
		<path strokeLinecap="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
	</svg>
);


function IncomingCallBar({ callerUsername, callerAvatarUrl, onHangup, onAnswer }) {
	return (
		<div className=" absolute top-0 left-1/2 -translate-x-1/2 w-65 h-16 mt-2 bg-[#0D1216]/70 z-50 text-white p-2 px-4 rounded-2xl shadow-lg border border-gray-500/10 flex items-center justify-between">
			{/* Left: Hangup Button */}
			<button
				onClick={onHangup}
				className="p-[6px] rounded-xl bg-red-600/90  hover:bg-red-700 border border-gray-500/20 text-white cursor-pointer flex-shrink-0 animate-pulse"
				aria-label="Hang up call"
			>
				<HangupIcon />
			</button>

			{/* Middle: Avatar + Username */}
			<div className="flex items-center flex-grow justify-center space-x-2 mx-4">
				{/* Middle-Left: Avatar */}
				<img
					src={callerAvatarUrl || "https://i.pravatar.cc/150?img=27"} // Use prop or default
					alt={`${callerUsername || 'Caller'} Avatar`}
					className="h-13 w-13 rounded-full flex-shrink-0 border border-gray-400/50 shadow-black "
				/>
				{/* Middle-Right: Username */}
				<span className="font-semibold text-sm ">{callerUsername || 'Incoming Call'}</span> {/* Use prop or default */}
			</div>

			{/* Right: Answer Button */}
			<button
				onClick={onAnswer}
				className="p-[6px] rounded-xl bg-green-500/90 hover:bg-green-600 border border-gray-500/20 text-white cursor-pointer flex-shrink-0  animate-pulse"
				aria-label="Answer call"
			>
				<AnswerIcon />
			</button>
		</div>
	);
}

export default IncomingCallBar;