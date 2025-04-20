import React, { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import useWebRTC from '../webRTC utils/useWebRTC';


function ChatAreaHeader({ ws, senderId, selectedFriend, setSelectedFriend }) {

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
	} = useWebRTC(ws.current, senderId, config); // Pass the ref object itself


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

	async function startVideoCallHandler(receiverId) {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
			const localStream = stream; // Store the stream
			console.log('Local stream obtained:', localStream);
			// Initiate the call using the obtained stream and receiver ID
			initiateCall(receiverId, localStream);
		} catch (err) {
			console.error('Error accessing media devices.', err);
			toast.error('Failed to access camera and microphone. Please check permissions.');
		}
	}

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
			<div className="flex items-center space-x-3"> {/* Buttons group */}
				{/* Voice Call Button */}
				<button className="p-2 rounded-full bg-green-500/90 hover:bg-green-600 text-white cursor-pointer">
					{/* Placeholder SVG for Voice Call */}
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
						<path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
					</svg>
				</button>
				{/* Video Call Button */}
				<button onClick={() => startVideoCallHandler(selectedFriend?.id)} className="p-2 rounded-full bg-blue-500/90 hover:bg-blue-600 text-white cursor-pointer">
					{/* Placeholder SVG for Video Call */}
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
						<path strokeLinecap="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
					</svg>
				</button>
				{/* Close Chat Button */}
				<button onClick={() => setSelectedFriend(null)} className="p-2 rounded-full bg-gray-700/50 hover:bg-gray-600/60 text-white/90 cursor-pointer">
					{/* Close (X) Icon SVG */}
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
						<path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
		</div>
	);
}

export default ChatAreaHeader;