import React from 'react';


function ChatAreaHeader({ startVideoCallHandler, hangupHandler, calleeIdRef, selectedFriend, setSelectedFriend, preparingCall, isCalling, isReceivingCall }) {


	return (
		<div className="h-18 flex items-center justify-between flex-shrink-0 p-5 border-b border-gray-700/20"> {/* Added flex, items-center, justify-between */}
			{/* Left Side: Avatar + User Info */}
			<div className="flex items-center">
				<img
					src={`https://i.pravatar.cc/150?img=${selectedFriend?.id}`} // Placeholder avatar
					alt="Chat Partner Avatar"
					className="h-10 w-10 rounded-full mr-3"
				/>
				<div>
					<div className="font-bold text-lg">{selectedFriend?.username} </div>
					<div className={`text-xs font-bold ${selectedFriend?.isOnline ? "text-green-500" : "text-gray-500"}`}> {selectedFriend?.isOnline ? "Online" : "Offline"}</div> {/* Status */}
				</div>
			</div>

			{/* Right Side: Call Buttons */}
			<div className="flex items-center space-x-3">

				{!isCalling && !preparingCall && !isReceivingCall &&
					<>
						<button className={`p-2 rounded-full ${selectedFriend?.isOnline ? "bg-green-500/90 hover:bg-green-600 cursor-pointer" : "bg-green-500/10 cursor-not-allowed"}  text-white `} disabled={!selectedFriend?.isOnline} >
							{/* Placeholder SVG for Voice Call */}
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
								<path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
							</svg>
						</button>

						<button onClick={() => startVideoCallHandler(selectedFriend?.id)} className={`p-2 rounded-full ${selectedFriend?.isOnline ? "bg-blue-500/90 hover:bg-blue-600 cursor-pointer" : "bg-blue-500/10 cursor-not-allowed"}  text-white `} disabled={!selectedFriend?.isOnline}>
							{/* Placeholder SVG for Video Call */}
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
								<path strokeLinecap="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
							</svg>
						</button>
					</>
				}

				{!isCalling && preparingCall &&
					<div className="flex items-center justify-center p-2">
						<div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
					</div>
				}

				{isCalling && calleeIdRef.current === selectedFriend?.id &&
					<>
						<p className="p-2    text-green-500/90 animate-pulse ">
							Calling...
						</p>

						<button
							onClick={hangupHandler}
							className="p-[6px] rounded-full bg-red-600/90  hover:bg-red-700 border border-gray-500/20 text-white cursor-pointer flex-shrink-0 "
							aria-label="Hang up call"
						>
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 rotate-135">
								<path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
							</svg>
						</button>
					</>
				}

				{/* Close Chat Button */}
				<button onClick={() => setSelectedFriend(null)} className="p-2 rounded-full bg-gray-700/50 hover:bg-gray-600/60 text-white/90 cursor-pointer">
					{/* Close (X) Icon SVG */}
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
						<path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
		</div >
	);
}

export default ChatAreaHeader;