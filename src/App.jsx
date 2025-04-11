import { useState, useEffect, useRef, useCallback } from 'react';
import useWebRTC from './webRTC utils/useWebRTC'; // Adjust path if needed
import './App.css'; // Optional: for basic styling

// Basic STUN server configuration
const rtcConfig = {
	iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

// WebSocket server URL (update if your server runs elsewhere)
const WS_URL_BASE = 'ws://localhost:8080/ws';

function App() {
	const [localId, setLocalId] = useState('');
	const [remoteId, setRemoteId] = useState('');
	const [ws, setWs] = useState(null);
	const [isConnected, setIsConnected] = useState(false);
	const [localStream, setLocalStream] = useState(null);
	const [getUserMediaError, setGetUserMediaError] = useState(null);

	const localVideoRef = useRef(null);
	const remoteVideoRef = useRef(null);

	// Instantiate the WebRTC hook
	const {
		remoteStream,
		connectionState,
		callState,
		isAudioMuted,
		isVideoMuted,
		error: webRTCError, // Rename to avoid conflict
		initiateCall,
		answerCall,
		hangUp,
		toggleAudioMute,
		toggleVideoMute,
	} = useWebRTC(ws, localId, rtcConfig); // Pass ws, localId, config

	// Effect to set up local video stream
	useEffect(() => {
		if (localStream && localVideoRef.current) {
			console.log('Setting local video srcObject');
			localVideoRef.current.srcObject = localStream;
		}
	}, [localStream]);

	// Effect to set up remote video stream
	useEffect(() => {
		if (remoteStream && remoteVideoRef.current) {
			console.log('Setting remote video srcObject');
			remoteVideoRef.current.srcObject = remoteStream;
		}
	}, [remoteStream]);

	// --- Handlers ---

	const handleConnect = useCallback(() => {
		if (!localId) {
			alert('Please enter a Local ID');
			return;
		}
		if (ws) {
			console.log('Already connected or connecting...');
			return;
		}

		console.log(`Connecting WebSocket with ID: ${localId}`);
		const wsUrl = `${WS_URL_BASE}?userId=${encodeURIComponent(localId)}`;
		const newWs = new WebSocket(wsUrl);

		newWs.onopen = () => {
			console.log('WebSocket Connected');
			setIsConnected(true);
			setWs(newWs); // Set ws state *after* connection is open
		};

		newWs.onclose = (event) => {
			console.log('WebSocket Disconnected:', event.code, event.reason);
			setIsConnected(false);
			setWs(null);
			// Optionally attempt reconnect or clean up call state via hangUp?
			// hangUp(); // Consider if disconnect should force hangup
		};

		newWs.onerror = (error) => {
			console.error('WebSocket Error:', error);
			setIsConnected(false);
			setWs(null);
			// Maybe set an error state
		};

		// Message handling is done inside useWebRTC hook
		// newWs.onmessage = (event) => { console.log('WS Message (App):', event.data); };

	}, [localId, ws]); // Dependency: localId, ws

	const handleGetMedia = useCallback(async () => {
		console.log('Requesting local media...');
		setGetUserMediaError(null);
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: true,
				audio: true,
			});
			console.log('Local media obtained');
			setLocalStream(stream);
		} catch (err) {
			console.error('Error getting user media:', err);
			setGetUserMediaError(err);
		}
	}, []);

	const handleInitiateCall = useCallback(() => {
		if (!remoteId) {
			alert('Please enter a Remote ID to call');
			return;
		}
		if (!localStream) {
			alert('Please get local media first');
			return;
		}
		initiateCall(remoteId, localStream);
	}, [initiateCall, remoteId, localStream]);

	const handleAnswerCall = useCallback(() => {
		if (!localStream) {
			alert('Please get local media first to answer');
			return;
		}
		answerCall(localStream);
	}, [answerCall, localStream]);

	// --- Render ---

	return (
		<div className="App">
			<h1>Simple WebRTC Test</h1>

			<div className="control-section">
				<h2>Setup</h2>
				<div>
					<label>Your ID: </label>
					<input
						type="text"
						value={localId}
						onChange={(e) => setLocalId(e.target.value)}
						disabled={isConnected}
					/>
					<button onClick={handleConnect} disabled={isConnected || !localId}>
						{isConnected ? 'Connected' : 'Connect WS'}
					</button>
					<span> Status: {isConnected ? 'Connected' : 'Disconnected'}</span>
				</div>
				<div>
					<label>Remote ID: </label>
					<input
						type="text"
						value={remoteId}
						onChange={(e) => setRemoteId(e.target.value)}
						disabled={callState !== 'idle'}
					/>
				</div>
				<div>
					<button onClick={handleGetMedia} disabled={!!localStream}>
						{localStream ? 'Media Obtained' : 'Get Media'}
					</button>
					{getUserMediaError && <p className="error">Media Error: {getUserMediaError.message}</p>}
				</div>
			</div>

			<div className="video-section">
				<div className="video-container">
					<h2>Local Video</h2>
					<video ref={localVideoRef} autoPlay playsInline muted />
					<div>
						<button onClick={toggleAudioMute} disabled={!localStream}>
							{isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
						</button>
						<button onClick={toggleVideoMute} disabled={!localStream}>
							{isVideoMuted ? 'Unmute Video' : 'Mute Video'}
						</button>
					</div>
				</div>
				<div className="video-container">
					<h2>Remote Video</h2>
					<video ref={remoteVideoRef} autoPlay playsInline />
				</div>
			</div>

			<div className="call-section">
				<h2>Call Control</h2>
				<button
					onClick={handleInitiateCall}
					disabled={callState !== 'idle' || !isConnected || !localStream || !remoteId}
				>
					Call
				</button>
				<button
					onClick={handleAnswerCall}
					disabled={callState !== 'receiving' || !isConnected || !localStream}
				>
					Answer
				</button>
				<button
					onClick={hangUp}
					disabled={callState === 'idle'}
				>
					Hang Up
				</button>
			</div>

			<div className="status-section">
				<h2>Status</h2>
				<p>WebSocket: {isConnected ? 'Connected' : 'Disconnected'}</p>
				<p>Call State: {callState}</p>
				<p>ICE Connection State: {connectionState}</p>
				{webRTCError && <p className="error">WebRTC Hook Error: {webRTCError.message}</p>}
			</div>
		</div>
	);
}

export default App;
