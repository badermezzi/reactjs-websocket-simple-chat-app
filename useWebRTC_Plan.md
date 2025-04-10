# Architectural Plan: `useWebRTC` Hook

**Project:** React WebSocket Simple Chat App
**Feature:** WebRTC Calling Functionality
**Component:** `useWebRTC` React Hook

**1. Goal:**
Create a single, reusable, and comprehensive React custom hook (`useWebRTC`) to manage the WebRTC connection lifecycle, state, and interactions for a single peer, capable of both initiating (outgoing) and handling (incoming) calls.

**2. Hook Signature & Parameters:**
The hook will be defined as `useWebRTC(ws, senderId, config)`:
*   `ws`: (Required) The established WebSocket instance used for signaling.
*   `senderId`: (Required) The unique identifier for the current user (local peer).
*   `config`: (Required) An object containing the `RTCPeerConnection` configuration, primarily the `iceServers` array (STUN/TURN). Example: `{ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }`.

**3. Internal State & Refs:**
The hook will manage the following internal state and refs:
*   `peerConnectionRef`: `useRef(null)` - Holds the single `RTCPeerConnection` instance managed by the hook.
*   `localStreamRef`: `useRef(null)` - Stores the `localStream` once provided via `initiateCall` or `answerCall`.
*   `receiverIdRef`: `useRef(null)` - Stores the `receiverId` when an outgoing call is initiated.
*   `candidateQueue`: `useRef([])` - Queues incoming ICE candidates received before the remote description is set.
*   `isNegotiating`: `useRef(false)` - Flag to prevent renegotiation race conditions.
*   `remoteStream`: `useState(null)` - Stores the `MediaStream` received from the remote peer.
*   `connectionState`: `useState('new')` - Tracks `peerConnection.iceConnectionState`.
*   `callState`: `useState('idle')` - Tracks the high-level state of the call (e.g., `'idle'`, `'calling'`, `'receiving'`, `'connected'`).
*   `isAudioMuted`: `useState(false)` - Tracks the mute state of the local audio track.
*   `isVideoMuted`: `useState(false)` - Tracks the mute state of the local video track.
*   `error`: `useState(null)` - Stores any significant errors encountered during setup or operation.

**4. Core Responsibilities:**
*   **`RTCPeerConnection` Management:** Create, configure (using `config`), and manage a single `RTCPeerConnection` instance.
*   **Event Listener Management:** Set up and tear down all necessary `RTCPeerConnection` and WebSocket event listeners within a `useEffect`.
*   **Signaling:** Handle sending (offers, answers, candidates) and receiving/processing (offers, answers, candidates) messages via the provided `ws` instance.
*   **State Management:** Maintain and expose relevant state (`remoteStream`, `connectionState`, `callState`, mute states, errors).
*   **API Exposure:** Provide functions to the UI component to control the call (`initiateCall`, `answerCall`, `hangUp`, mute toggles).

**5. `useEffect` Logic (Setup & Cleanup):**
*   **Dependencies:** `[ws, senderId, config]` (Note: Changes to `config` might trigger recreation/reconfiguration if implemented, otherwise just `ws`, `senderId`).
*   **Setup:**
    *   Check if `ws` is valid.
    *   Create the `RTCPeerConnection` instance using `config` if it doesn't exist (store in `peerConnectionRef`). Handle potential creation errors.
    *   Define `handleWebSocketMessage` function internally.
    *   Attach listeners to `peerConnectionRef.current`:
        *   `onicecandidate`: Sends candidate via `ws` (using `receiverIdRef.current`). Checks `ws.readyState`.
        *   `ontrack`: Updates `remoteStream` state.
        *   `oniceconnectionstatechange`: Updates `connectionState` state. Attempts `restartIce()` if state becomes `'failed'`.
        *   `onnegotiationneeded`: Handles renegotiation logic (using `isNegotiating` ref, `receiverIdRef.current`, checking `signalingState` and `ws.readyState`).
    *   Attach listener to `ws`:
        *   `message`: Calls `handleWebSocketMessage`.
            *   `handleWebSocketMessage` logic: Parses message. If `offer` & state is `idle`, sets remote description, updates `callState` to `'receiving'`. If `answer` & state is `calling`, sets remote description, processes candidate queue, updates `callState` to `'connected'`. If `ice-candidate`, adds to queue or directly via `addIceCandidate` based on `remoteDescription` presence. Handles errors.
*   **Cleanup (Return Function):**
    *   Remove the `message` listener from `ws`.
    *   Set all `peerConnectionRef.current.on...` listeners to `null`.
    *   Consider closing the `peerConnectionRef.current` if appropriate based on application logic (e.g., if the hook itself represents a single call session). Reset internal state.

**6. Returned Functions (API):**
The hook will return an object containing:
*   `initiateCall(receiverId, localStream)`:
    *   Checks if `callState` is `'idle'`.
    *   Stores `receiverId` in `receiverIdRef.current`.
    *   Stores `localStream` in `localStreamRef.current`.
    *   Adds tracks from `localStream` to `peerConnection`.
    *   Creates offer, sets local description.
    *   Sends `offer` message via `ws`.
    *   Updates `callState` to `'calling'`.
    *   Handles errors, updating `error` state.
*   `answerCall(localStream)`:
    *   Checks if `callState` is `'receiving'` (meaning an offer was received and set as remote description).
    *   Stores `localStream` in `localStreamRef.current`.
    *   Adds tracks from `localStream` to `peerConnection`.
    *   Creates answer, sets local description.
    *   Sends `answer` message via `ws`.
    *   Updates `callState` to `'connected'`.
    *   Processes any queued ICE candidates.
    *   Handles errors, updating `error` state.
*   `hangUp()`:
    *   Closes `peerConnectionRef.current`.
    *   Sends a 'hangup' message via `ws` (optional, depends on signaling protocol).
    *   Resets all relevant internal state (`remoteStream`, `connectionState`, `callState`, `error`, refs etc.) to initial values.
    *   Updates `callState` to `'idle'`.
*   `toggleAudioMute()`:
    *   Accesses `localStreamRef.current`.
    *   Toggles `enabled` state of audio tracks.
    *   Updates `isAudioMuted` state.
*   `toggleVideoMute()`:
    *   Accesses `localStreamRef.current`.
    *   Toggles `enabled` state of video tracks.
    *   Updates `isVideoMuted` state.

**7. Returned State:**
The hook will return an object containing:
*   `remoteStream`
*   `connectionState`
*   `callState`
*   `isAudioMuted`
*   `isVideoMuted`
*   `error`

**8. File Structure:**
*   The hook will reside in `src/webRTC utils/useWebRTC.js` (renaming from `useStartCall.js`).