import { useState, useEffect, useRef, useCallback } from 'react';

// Initial state values
const INITIAL_CALL_STATE = 'idle'; // idle, calling, receiving, connected
const INITIAL_CONNECTION_STATE = 'new';

/**
 * Comprehensive hook to manage a WebRTC peer connection lifecycle.
 * ws: The WebSocket instance for signaling.
 * senderId: The current user's ID.
 * config: RTCPeerConnection configuration (iceServers).
 */
function useWebRTC(ws, senderId, config) {
	// Refs
	const peerConnectionRef = useRef(null);
	const localStreamRef = useRef(null);
	const receiverIdRef = useRef(null);
	const candidateQueue = useRef([]);
	const isNegotiating = useRef(false);
	const callStateRef = useRef(INITIAL_CALL_STATE); // Ref to track callState for effect handlers

	// State
	const [remoteStream, setRemoteStream] = useState(null);
	const [connectionState, setConnectionState] = useState(INITIAL_CONNECTION_STATE);
	const [callState, setCallState] = useState(INITIAL_CALL_STATE);
	const [isAudioMuted, setIsAudioMuted] = useState(false);
	const [isVideoMuted, setIsVideoMuted] = useState(false);
	const [error, setError] = useState(null);

	// Effect to keep callStateRef updated
	useEffect(() => {
		callStateRef.current = callState;
	}, [callState]);

	// --- Effect for Listener Setup & Cleanup ---
	useEffect(() => {
		if (!ws || ws.readyState !== WebSocket.OPEN) {
			console.warn('WebSocket not available or not open in useEffect.');
			// Optionally set an error state or handle differently
			return;
		}

		console.log('useWebRTC effect setup running...');
		setError(null); // Clear previous errors on setup

		// Create PeerConnection if it doesn't exist
		if (!peerConnectionRef.current) {
			try {
				console.log('Creating PeerConnection with config:', config);
				peerConnectionRef.current = new RTCPeerConnection(config);
				setConnectionState(peerConnectionRef.current.iceConnectionState); // Initialize state
			} catch (e) {
				console.error('Failed to create PeerConnection:', e);
				setError(e);
				return; // Cannot proceed without PeerConnection
			}
		}

		const pc = peerConnectionRef.current; // Alias for convenience

		// --- WebSocket Message Handler ---
		const handleWebSocketMessage = async (event) => {
			try {
				const message = JSON.parse(event.data);
				console.log('Received WebSocket message:', message);

				// Determine receiver based on message structure (adapt if needed)
				const messageReceiverId = message.receiverId || (message.type === 'answer' || message.type === 'ice-candidate' ? message.senderId : null);

				// Ignore messages not intended for this user
				if (messageReceiverId && messageReceiverId !== senderId) {
					console.log('Ignoring message intended for another user:', messageReceiverId);
					return;
				}


				switch (message.type) {
					case 'offer':
						// Use ref for state check inside effect handler
						if (callStateRef.current !== INITIAL_CALL_STATE) {
							console.warn(`Received offer in unexpected state: ${callStateRef.current}. Ignoring.`);
							return;
						}
						console.log('Received offer from peer:', message.senderId);
						try {
							receiverIdRef.current = message.senderId; // Store sender as the receiver for answer/candidates
							await pc.setRemoteDescription(new RTCSessionDescription(message.offer));
							console.log('Remote description (offer) set.');
							setCallState('receiving'); // Update state: ready to answer
							// UI should now prompt user to answer
						} catch (e) {
							console.error('Error setting remote description (offer):', e);
							setError(e);
						}
						break;

					case 'answer':
						// Use ref for state check inside effect handler
						if (callStateRef.current !== 'calling') {
							console.warn(`Received answer in unexpected state: ${callStateRef.current}. Ignoring.`);
							return;
						}
						console.log('Received answer from peer:', message.senderId);
						try {
							const remoteDesc = new RTCSessionDescription(message.answer);
							await pc.setRemoteDescription(remoteDesc);
							console.log('Remote description (answer) set.');
							setCallState('connected'); // Update state

							// Process queued candidates
							console.log(`Processing ${candidateQueue.current.length} queued candidates...`);
							await Promise.all(candidateQueue.current.map(async (candidate) => {
								try {
									await pc.addIceCandidate(candidate);
									console.log('Added queued ICE candidate.');
								} catch (e) {
									console.error('Error adding queued ICE candidate:', e);
								}
							}));
							candidateQueue.current = []; // Clear queue
						} catch (e) {
							console.error('Error setting remote description (answer):', e);
							setError(e);
						}
						break;

					case 'ice-candidate':
						console.log('Received ICE candidate from peer:', message.senderId);
						try {
							if (message.candidate) {
								const candidate = new RTCIceCandidate(message.candidate);
								if (pc.remoteDescription) {
									await pc.addIceCandidate(candidate);
									console.log('Added received ICE candidate directly.');
								} else {
									candidateQueue.current.push(candidate);
									console.log('Queued received ICE candidate.');
								}
							}
						} catch (e) {
							console.error('Error adding received ICE candidate:', e);
							// Don't necessarily set global error, maybe just log
						}
						break;

					// Add cases for other signaling messages like 'hangup' if needed
					default:
						console.log('Received unknown message type:', message.type);
				}
			} catch (e) {
				console.error('Error parsing WebSocket message or invalid message format:', e);
				// Don't necessarily set global error, maybe just log
			}
		};

		// --- PeerConnection Event Listeners ---
		const handleIceCandidate = (event) => {
			if (event.candidate) {
				console.log('Generated ICE Candidate:', event.candidate);
				if (ws.readyState === WebSocket.OPEN) {
					// Send candidate - receiverIdRef should be set by initiateCall or offer handling
					const targetId = receiverIdRef.current;
					if (targetId) {
						ws.send(JSON.stringify({
							type: 'ice-candidate',
							candidate: event.candidate,
							senderId: senderId,
							receiverId: targetId
						}));
					} else {
						console.warn('Cannot send ICE candidate, receiverId not set.');
					}
				} else {
					console.warn('WebSocket not open. Cannot send ICE candidate.');
				}
			}
		};

		const handleTrack = (event) => {
			console.log('Track received:', event.track, 'Stream:', event.streams[0]);
			if (event.streams && event.streams[0]) {
				setRemoteStream(event.streams[0]);
			}
		};

		// hangUp is included in useEffect dependencies, so direct call is safe
		const handleIceConnectionStateChange = () => {
			const newState = pc.iceConnectionState;
			console.log(`ICE Connection State change: ${newState}`);
			setConnectionState(newState);
			if (newState === 'connected' || newState === 'completed') {
				console.log('WebRTC connection established.');
				if (callStateRef.current !== 'connected') setCallState('connected'); // Ensure call state reflects connection (use ref)
			} else if (newState === 'failed') {
				console.error('WebRTC connection failed. Attempting ICE restart...');
				pc.restartIce();
			} else if (newState === 'disconnected') {
				console.warn('WebRTC connection disconnected. May recover...');
				// No automatic action here per plan, but could add timeout for restart
			} else if (newState === 'closed') {
				console.log('WebRTC connection closed.');
				// Reset state if closed unexpectedly and not already idle (use ref here)
				if (callStateRef.current !== INITIAL_CALL_STATE) {
					console.warn('Connection closed unexpectedly. Resetting state.');
					// Call hangUp directly to ensure full cleanup and state reset
					// Use a check or flag if hangUp might cause issues here, but usually it's safe
					hangUp(); // Call hangUp directly
				}
			}
		};

		const handleNegotiationNeeded = async () => {
			if (isNegotiating.current || pc.signalingState !== 'stable') {
				console.log('Skipping negotiationneeded event:', { negotiating: isNegotiating.current, state: pc.signalingState });
				return;
			}

			isNegotiating.current = true;
			console.log('Negotiation needed, creating new offer...');
			try {
				// Ensure receiverIdRef is set (might happen if tracks added before initial call setup)
				const targetId = receiverIdRef.current;
				if (!targetId) {
					console.warn('Negotiation needed, but no receiverId set. Aborting.');
					isNegotiating.current = false;
					return;
				}

				const offer = await pc.createOffer();
				if (pc.signalingState !== 'stable') {
					console.log('Signaling state changed during offer creation, aborting negotiation.');
					isNegotiating.current = false;
					return;
				}
				await pc.setLocalDescription(offer);
				console.log('New local description set, sending new offer...');
				if (ws.readyState === WebSocket.OPEN) {
					ws.send(JSON.stringify({
						type: 'offer', // Re-send offer type
						offer: pc.localDescription,
						senderId: senderId,
						receiverId: targetId
					}));
				} else {
					console.error('WebSocket not open during re-negotiation. Cannot send new offer.');
					// Set error state?
				}
			} catch (e) {
				console.error('Error during renegotiation:', e);
				setError(e);
			} finally {
				isNegotiating.current = false;
			}
		};

		// Attach listeners
		pc.onicecandidate = handleIceCandidate;
		pc.ontrack = handleTrack;
		pc.oniceconnectionstatechange = handleIceConnectionStateChange;
		pc.onnegotiationneeded = handleNegotiationNeeded;
		ws.addEventListener('message', handleWebSocketMessage);

		// Cleanup function
		return () => {
			console.log('useWebRTC effect cleanup running...');
			// Remove listeners
			ws.removeEventListener('message', handleWebSocketMessage);
			if (peerConnectionRef.current) {
				peerConnectionRef.current.onicecandidate = null;
				peerConnectionRef.current.ontrack = null;
				peerConnectionRef.current.oniceconnectionstatechange = null;
				peerConnectionRef.current.onnegotiationneeded = null;

				// Close the connection and nullify ref on cleanup if dependencies change or component unmounts
				console.log('Closing PeerConnection in cleanup...');
				peerConnectionRef.current.close();
				peerConnectionRef.current = null;
			}
			// Removed duplicate log line
		};
	}, [ws, senderId, config, hangUp]); // Add hangUp dependency

	// --- Action Functions ---

	const initiateCall = useCallback(async (receiverId, localStream) => {
		console.log(`Initiating call to ${receiverId}...`);
		if (callState !== INITIAL_CALL_STATE) {
			console.error('Cannot initiate call, already in a call or setup state:', callState);
			setError(new Error(`Cannot initiate call in state: ${callState}`));
			return;
		}
		if (!peerConnectionRef.current) {
			console.error('PeerConnection not initialized.');
			setError(new Error('PeerConnection not available.'));
			return;
		}
		if (!localStream) {
			console.error('Local stream not provided for initiateCall.');
			setError(new Error('Local stream is required to initiate a call.'));
			return;
		}
		if (!receiverId) {
			console.error('Receiver ID not provided for initiateCall.');
			setError(new Error('Receiver ID is required to initiate a call.'));
			return;
		}

		setError(null); // Clear previous errors
		const pc = peerConnectionRef.current;

		try {
			// Store refs
			receiverIdRef.current = receiverId;
			localStreamRef.current = localStream;

			// Add tracks
			console.log('Adding local tracks...');
			localStream.getTracks().forEach(track => {
				// Check if track already added - might happen on re-initiation attempts
				if (!pc.getSenders().find(sender => sender.track === track)) {
					pc.addTrack(track, localStream);
					console.log('Added track:', track.kind);
				} else {
					console.log('Track already added:', track.kind);
				}
			});

			// Update mute states based on initial track state (optional but good)
			setIsAudioMuted(!localStream.getAudioTracks().some(t => t.enabled));
			setIsVideoMuted(!localStream.getVideoTracks().some(t => t.enabled));

			// Create Offer (negotiationneeded might fire here too, flag handles it)
			console.log('Creating offer...');
			isNegotiating.current = true; // Prevent negotiationneeded collision
			const offer = await pc.createOffer();
			// Check signaling state before setting local description
			if (pc.signalingState !== 'stable') {
				console.warn('Signaling state not stable after createOffer, aborting initiateCall.');
				isNegotiating.current = false;
				return;
			}
			await pc.setLocalDescription(offer);
			console.log('Local description set.');
			isNegotiating.current = false; // Allow negotiationneeded again

			// Send Offer
			console.log('Sending offer to remote peer...');
			if (ws.readyState === WebSocket.OPEN) {
				ws.send(JSON.stringify({
					type: 'offer',
					offer: pc.localDescription, // Send the generated description
					senderId: senderId,
					receiverId: receiverId
				}));
				setCallState('calling'); // Update state
			} else {
				console.error('WebSocket not open. Cannot send offer.');
				setError(new Error('WebSocket connection is not open.'));
				// Should we revert state? Maybe hangUp?
				// For now, just set error.
			}
		} catch (e) {
			console.error('Error during initiateCall:', e);
			setError(e);
			isNegotiating.current = false; // Ensure flag is reset on error
			hangUp(); // Clean up on failure
		}
	}, [ws, senderId, callState, hangUp]); // Remove unnecessary config dependency

	const answerCall = useCallback(async (localStream) => {
		console.log('Answering incoming call...');
		if (callState !== 'receiving') {
			console.error('Cannot answer call, not in receiving state:', callState);
			setError(new Error(`Cannot answer call in state: ${callState}`));
			return;
		}
		if (!peerConnectionRef.current) {
			console.error('PeerConnection not initialized.');
			setError(new Error('PeerConnection not available.'));
			return;
		}
		if (!localStream) {
			console.error('Local stream not provided for answerCall.');
			setError(new Error('Local stream is required to answer a call.'));
			return;
		}
		if (!receiverIdRef.current) {
			// This should have been set when the offer was received and processed
			console.error('Cannot answer call, receiverId (original caller) not set.');
			setError(new Error('Internal error: Original caller ID not available.'));
			return;
		}

		setError(null); // Clear previous errors
		const pc = peerConnectionRef.current;
		const targetId = receiverIdRef.current; // The original caller

		try {
			// Store local stream ref
			localStreamRef.current = localStream;

			// Add tracks (ensure remote description is set first, which it should be in 'receiving' state)
			console.log('Adding local tracks for answer...');
			localStream.getTracks().forEach(track => {
				if (!pc.getSenders().find(sender => sender.track === track)) {
					pc.addTrack(track, localStream);
					console.log('Added track:', track.kind);
				} else {
					console.log('Track already added:', track.kind);
				}
			});

			// Update mute states
			setIsAudioMuted(!localStream.getAudioTracks().some(t => t.enabled));
			setIsVideoMuted(!localStream.getVideoTracks().some(t => t.enabled));

			// Create Answer
			console.log('Creating answer...');
			const answer = await pc.createAnswer();
			console.log('Answer created.');
			await pc.setLocalDescription(answer);
			console.log('Local description (answer) set.');

			// Send Answer
			console.log('Sending answer to remote peer...');
			if (ws.readyState === WebSocket.OPEN) {
				ws.send(JSON.stringify({
					type: 'answer',
					answer: pc.localDescription,
					senderId: senderId,
					receiverId: targetId // Send back to the original caller
				}));
				// Note: State update to 'connected' and queue processing happens
				// when the *caller* receives this answer and sets *their* remote description,
				// or potentially based on ICE connection state changes.
				// Let's rely on ICE state change for 'connected' state for the answerer.
			} else {
				console.error('WebSocket not open. Cannot send answer.');
				setError(new Error('WebSocket connection is not open.'));
			}
		} catch (e) {
			console.error('Error during answerCall:', e);
			setError(e);
			hangUp(); // Clean up on failure
		}
	}, [ws, senderId, callState, hangUp]); // Remove unnecessary config dependency

	const hangUp = useCallback(() => {
		console.log('Hanging up call...');
		if (peerConnectionRef.current) {
			// Stop all local media tracks
			if (localStreamRef.current) {
				localStreamRef.current.getTracks().forEach(track => track.stop());
				localStreamRef.current = null;
			}
			// Close the connection
			peerConnectionRef.current.close();
			peerConnectionRef.current = null; // Release the reference
			console.log('PeerConnection closed.');
		}

		// Send hangup signal (optional, depends on your signaling protocol)
		const targetId = receiverIdRef.current;
		if (targetId && ws && ws.readyState === WebSocket.OPEN) {
			console.log(`Sending hangup signal to ${targetId}`);
			ws.send(JSON.stringify({
				type: 'hangup',
				senderId: senderId,
				receiverId: targetId
			}));
		}

		// Reset state
		setRemoteStream(null);
		setConnectionState(INITIAL_CONNECTION_STATE);
		setCallState(INITIAL_CALL_STATE);
		setIsAudioMuted(false);
		setIsVideoMuted(false);
		setError(null);
		candidateQueue.current = [];
		receiverIdRef.current = null;
		isNegotiating.current = false;

	}, [ws, senderId]); // Include ws and senderId if used for signaling hangup

	const toggleAudioMute = useCallback(() => {
		if (!localStreamRef.current) {
			console.warn('Cannot toggle audio mute, local stream not available.');
			return;
		}
		let newMuteState = false;
		localStreamRef.current.getAudioTracks().forEach(track => {
			track.enabled = !track.enabled;
			newMuteState = !track.enabled; // State reflects if it *is* muted
			console.log(`Audio track ${track.id} enabled: ${track.enabled}`);
		});
		setIsAudioMuted(newMuteState);
		console.log('Audio mute state:', newMuteState);
	}, []); // No dependencies needed if using ref

	const toggleVideoMute = useCallback(() => {
		if (!localStreamRef.current) {
			console.warn('Cannot toggle video mute, local stream not available.');
			return;
		}
		let newMuteState = false;
		localStreamRef.current.getVideoTracks().forEach(track => {
			track.enabled = !track.enabled;
			newMuteState = !track.enabled; // State reflects if it *is* muted
			console.log(`Video track ${track.id} enabled: ${track.enabled}`);
		});
		setIsVideoMuted(newMuteState);
		console.log('Video mute state:', newMuteState);
	}, []); // No dependencies needed if using ref

	// --- Return API ---
	return {
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
	};
}

export default useWebRTC;