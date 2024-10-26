import { useParams, useSearchParams } from "react-router-dom"
import Navbar from "../components/Navbar"
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

type WSMessage = {
	type: string,
	from: string | undefined,
	data: string | unknown,
}

type ChatMessage = {
	from: string,
	content: string,
}

const Conference = () => {
	const { roomID } = useParams<{ roomID: string }>()
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const localVideoRef = useRef<HTMLVideoElement>(null);
	const remoteVideoRef = useRef<HTMLVideoElement>(null);

	const [socket, setSocket] = useState<WebSocket | undefined>();
	const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
	const [chatContent, setChatContent] = useState<string>("");
	const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
	const [username, setUsername] = useState<string>("")

	useEffect(() => {
		const username = searchParams.get("name");
		const url = `${import.meta.env.VITE_API_URL}/rooms/${roomID}?name=${username}`;
		const newSocket = new WebSocket(url);

		newSocket.onclose = () => {
			alert("WebSocket connection closed");
			navigate("/");
		};
		newSocket.onmessage = (event) => {
			const wsMessage: WSMessage = JSON.parse(event.data);
			if (wsMessage.type == "error") alert(wsMessage.data);
		}

		setSocket(newSocket);

		// Cleanup event listener when the component unmounts or when the socket changes
		return () => {
			if (socket) {
				socket.close();
			}
		};

	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	// after socket mounts, initiate WebRTC connection and set peer
	useEffect(() => {
		if (!socket) return;

		(async () => {
			const myStream = await getLocalMediaStream();
			if (!myStream) return;

			// setting up WebRTC
			const peer = new RTCPeerConnection({
				iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
			});
			myStream.getTracks().forEach(track => peer.addTrack(track, myStream));

			// handle remote stream
			peer.ontrack = async (event) => {
				if (remoteVideoRef.current) {
					remoteVideoRef.current.srcObject = event.streams[0];
				}
			};

			peer.onicecandidate = async (event) => {
				if (event.candidate)
					socket.send(JSON.stringify({ type: "ice", data: event.candidate }));
			}

			setPeerConnection(peer);
		})();
	}, [socket]);

	// when the peerConnection is set, attach handlers, and send sdp offer
	useEffect(() => {
		if (!peerConnection || !socket) return;

		(async () => {
			socket.onmessage = (event) => {
				const wsMessage: WSMessage = JSON.parse(event.data);
				wsMessageHandler(wsMessage);
			};

			const offer = await peerConnection.createOffer();
			await peerConnection.setLocalDescription(offer);

			// Send the SDP offer via WebSocket
			socket.send(JSON.stringify({ type: "sdp-offer", data: offer }));
		})();
	}, [peerConnection, socket]); // eslint-disable-line react-hooks/exhaustive-deps

	// get the local media stream (camera and microphone)
	const getLocalMediaStream = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

			if (localVideoRef.current) {
				localVideoRef.current.srcObject = stream;
			}

			return stream;
		} catch (err) {
			alert(`Could not access media devices. ${err}`);
		}
	}

	const wsMessageHandler = async (wsMessage: WSMessage) => {
		// set the visible username
		if (username === "" && wsMessage.from) setUsername(wsMessage.from);

		switch (wsMessage.type) {
			case "chat":
				chatMessageHandler(wsMessage);
				break;
			case "sdp-offer":
				await handleSDPOffer(wsMessage.data as RTCSessionDescriptionInit);
				break;
			case "sdp-answer":
				await handleSDPAnswer(wsMessage.data as RTCSessionDescriptionInit);
				break;
			case "ice":
				await handleICECandidate(wsMessage.data as RTCIceCandidate);
				break;
			case "error":
				alert(wsMessage.data);
				break;
			default:
				alert("Invalid websocket message received");
		}
	}

	const chatMessageHandler = (wsMessage: WSMessage) => {
		if (wsMessage.from && typeof wsMessage.data === "string") {
			const newChat: ChatMessage = {
				from: wsMessage.from,
				content: wsMessage.data,
			}

			setChatMessages((prevMessages) => [newChat, ...prevMessages]);
		} else {
			alert("Invalid wsMessage format");
		}
	}

	const sendChat = () => {
		const username = searchParams.get("name");
		if (!socket) { alert("Socket was not mounted"); return; }
		if (!username) { alert("name parameter not passed"); return; }

		const newChat: ChatMessage = {
			from: username,
			content: chatContent,
		}

		socket.send(JSON.stringify({ type: "chat", data: chatContent }));

		setChatMessages((prevMessages) => [newChat, ...prevMessages]);
		setChatContent("");
	}

	const handleSDPOffer = async (offer: RTCSessionDescriptionInit) => {
		if (!peerConnection || !socket) {
			alert("Could not send SDP Offer");
			return;
		}

		await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
		const answer = await peerConnection.createAnswer();
		await peerConnection.setLocalDescription(answer);
		socket.send(JSON.stringify({ type: "sdp-answer", data: answer }));
	};

	const handleSDPAnswer = async (answer: RTCSessionDescriptionInit) => {
		if (!peerConnection || !socket) {
			alert("Could not send SDP Answer");
			return;
		}

		await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));

		// handle ICE candidates
		peerConnection.onicecandidate = (event) => {
			if (event.candidate) {
				socket.send(JSON.stringify({ type: "ice", data: event.candidate }));
			}
		};
	};

	const handleICECandidate = async (candidate: RTCIceCandidate) => {
		if (!peerConnection) {
			alert("Could not send ICE Candidate");
			return;
		}
		await peerConnection.addIceCandidate(candidate);
	};

	return (
		<div className="flex flex-col h-screen">
			<Navbar roomID={roomID} />
			<div className="flex flex-1">
				{/* Main video section */}
				<div className="flex-1 bg-gray-800 flex flex-col justify-center items-center relative">
					{/* Remote video */}
					<video
						ref={remoteVideoRef}
						className="h-full object-cover"
						autoPlay
						playsInline
					></video>
					<div className="absolute bottom-0 bg-gray-900 bg-opacity-75 text-white p-2">
						{(username === "") ? "Loading..." : username}
					</div>

					{/* Local video in a smaller block */}
					<video
						ref={localVideoRef}
						className="absolute bottom-4 right-4 w-48 h-36 bg-black border-2 border-gray-200"
						autoPlay
						playsInline
						muted
					></video>
				</div>

				{/* Chat Section */}
				<div className="w-1/4 bg-white p-4 border-l border-gray-200">
					<div className="flex flex-col h-full">
						<h2 className="text-xl font-semibold mb-4">Chat</h2>
						<div className="flex-grow overflow-y-scroll p-2 bg-gray-100 rounded mb-4">
							{/* Chat messages would go here */}
							{chatMessages.map(chatMessage =>
								<div className="message">
									<span className="font-semibold">{chatMessage.from}:</span> {chatMessage.content}
								</div>
							)}
						</div>

						<div className="flex">
							<input
								type="text"
								value={chatContent}
								onChange={(e) => setChatContent(e.target.value)}
								placeholder="Type your message..."
								className="flex-grow p-2 border rounded-l-md focus:outline-none"
							/>
							<button
								onClick={sendChat}
								className="p-2 bg-blue-600 text-white rounded-r-md"
							>
								Send
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Conference