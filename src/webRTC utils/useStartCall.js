import { useState, useEffect, useRef } from 'react';

function useStartCall(localStream, peerConnection, ws, senderId, receiverId) {
	const [remoteStream, setRemoteStream] = useState(null);
	const [connectionState, setConnectionState] = useState(peerConnection?.iceConnectionState || 'new');
	const isNegotiating = useRef(false); // Flag to prevent negotiation loops
	const [setupError, setSetupError] = useState(null); // State for setup errors
	const candidateQueue = useRef([]); // Queue for candidates arriving before remote description is set

	useEffect(() => {
		if (!localStream || !peerConnection || !ws) {
			// Ensure all required objects are available
			return;
		}

		// Define the message handler in the useEffect scope
		const handleWebSocketMessage = async (event) => {
			try {
				const message = JSON.parse(event.data);
				console.log('Received WebSocket message:', message);

				if (message.type === 'answer' && message.senderId === receiverId) {
					console.log('Received answer from peer:', message.answer);
					try {
						const remoteDesc = new RTCSessionDescription(message.answer);
						console.log('Setting remote description with answer...');
						await peerConnection.setRemoteDescription(remoteDesc);
						console.log('Remote description set.');
						// Process any queued candidates now that remote description is set
						console.log(`Processing ${candidateQueue.current.length} queued candidates...`);
						await Promise.all(candidateQueue.current.map(async (candidate) => {
							try {
								await peerConnection.addIceCandidate(candidate);
								console.log('Added queued ICE candidate.');
							} catch (error) {
								console.error('Error adding queued ICE candidate:', error);
							}
						}));
						candidateQueue.current = []; // Clear the queue
					} catch (error) {
						console.error('Error setting remote description:', error);
					}
				} else if (message.type === 'ice-candidate' && message.senderId === receiverId) {
					console.log('Received ICE candidate from peer:', message.candidate);
					try {
						if (message.candidate) {
							const candidate = new RTCIceCandidate(message.candidate);
							if (peerConnection.remoteDescription) {
								// Remote description is set, add candidate directly
								await peerConnection.addIceCandidate(candidate);
								console.log('Added received ICE candidate directly.');
							} else {
								// Remote description not set yet, queue the candidate
								candidateQueue.current.push(candidate);
								console.log('Queued received ICE candidate.');
							}
						}
					} catch (error) {
						console.error('Error adding received ICE candidate:', error);
					}
				}
			} catch (error) {
				console.error('Error parsing WebSocket message or invalid message format:', error);
			}
		};

		async function setupCall() {
			try {
				console.log('Setting up WebRTC call...');
				console.log('Starting call with local stream:', localStream);
				console.log('Using PeerConnection:', peerConnection);

				// Add tracks
				localStream.getTracks().forEach(track => {
					peerConnection.addTrack(track, localStream);
					console.log('Added track:', track);
				});

				// Set up listeners
				peerConnection.onicecandidate = event => {
					if (event.candidate) {
						console.log('Generated ICE Candidate:', event.candidate);
						if (ws.readyState === WebSocket.OPEN) {
							ws.send(JSON.stringify({
								type: 'ice-candidate',
								candidate: event.candidate,
								senderId: senderId,
								receiverId: receiverId
							}));
						} else {
							console.warn('WebSocket not open. Cannot send ICE candidate.');
						}
					}
				};
				peerConnection.ontrack = event => {
					console.log('Track received:', event.track, 'Stream:', event.streams[0]);
					if (event.streams && event.streams[0]) {
						setRemoteStream(event.streams[0]);
					}
				};
				peerConnection.oniceconnectionstatechange = () => {
					const newState = peerConnection.iceConnectionState;
					console.log(`ICE Connection State change: ${newState}`);
					setConnectionState(newState);
					if (newState === 'connected' || newState === 'completed') {
						console.log('WebRTC connection established.');
					} else if (newState === 'failed') {
						console.error('WebRTC connection failed. Attempting ICE restart...');
						peerConnection.restartIce();
						// Optionally restart ICE or handle failure
					}
				};
				peerConnection.onnegotiationneeded = async () => {
					if (isNegotiating.current || peerConnection.signalingState !== 'stable') {
						console.log('Skipping negotiationneeded event:', { negotiating: isNegotiating.current, state: peerConnection.signalingState });
						return;
					}

					isNegotiating.current = true;
					console.log('Negotiation needed, creating new offer...');
					try {
						const offer = await peerConnection.createOffer();
						// Check signaling state again before setting local description
						if (peerConnection.signalingState !== 'stable') {
							console.log('Signaling state changed during offer creation, aborting negotiation.');
							isNegotiating.current = false;
							return;
						}
						await peerConnection.setLocalDescription(offer);
						console.log('New local description set, sending new offer...');
						if (ws.readyState === WebSocket.OPEN) {
							ws.send(JSON.stringify({
								type: 'offer', // Re-send offer type
								offer: peerConnection.localDescription, // Send the latest local description
								senderId: senderId,
								receiverId: receiverId
							}));
						} else {
							// Log the error. The re-negotiation attempt failed because the signaling channel is closed.
							// The isNegotiating flag will be reset in the finally block.
							console.error('WebSocket not open during re-negotiation. Cannot send new offer.');
						}
					} catch (error) {
						console.error('Error during renegotiation:', error);
					} finally {
						isNegotiating.current = false; // Reset flag
					}
				};

				// Create Offer
				console.log('Creating offer...');
				const offer = await peerConnection.createOffer();
				console.log('Offer created:', offer);
				console.log('Setting local description with offer...');
				await peerConnection.setLocalDescription(offer);
				console.log('Local description set.');
				console.log('Sending offer to remote peer...');
				if (ws.readyState === WebSocket.OPEN) {
					ws.send(JSON.stringify({
						type: 'offer',
						offer: offer, // or peerConnection.localDescription
						senderId: senderId,
						receiverId: receiverId
					}));
				} else {
					console.error('WebSocket not open. Cannot send offer.');
					// Optional: Throw error or handle differently
				}
				// Add the message listener using the handler defined in the outer scope
				ws.addEventListener('message', handleWebSocketMessage);

			} catch (error) {
				console.error('Error during WebRTC setup:', error);
				setSetupError(error); // Update the error state
			}
		}

		setupCall(); // Execute the async setup function

		// Cleanup function for useEffect
		return () => {
			console.log('Cleaning up useStartCall effect...');
			// Remove the message listener to prevent memory leaks and issues on re-render
			ws.removeEventListener('message', handleWebSocketMessage);
			// Optional: Consider removing other peerConnection listeners if appropriate
			// peerConnection.onicecandidate = null;
			// peerConnection.ontrack = null;
			// peerConnection.oniceconnectionstatechange = null;
			// peerConnection.onnegotiationneeded = null; // Also remove this listener if cleaning up PC listeners
		};

	}, [localStream, peerConnection, ws, senderId, receiverId]); // Dependencies for useEffect

	return { remoteStream, connectionState, setupError };
}

export default useStartCall;