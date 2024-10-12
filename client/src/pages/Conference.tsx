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
	const navigate = useNavigate()
	const localVideoRef = useRef<HTMLVideoElement>(null);
	const remoteVideoRef = useRef<HTMLVideoElement>(null);

	const [socket, setSocket] = useState<WebSocket | undefined>()
	const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])

	useEffect(() => {
		// // Get the local media stream (camera and microphone)
		// navigator.mediaDevices.getUserMedia({ video: true, audio: true })
		// 	.then(stream => {
		// 		if (localVideoRef.current) {
		// 			localVideoRef.current.srcObject = stream;
		// 		}
		// 	})
		// 	.catch(err => {
		// 		console.error('Error accessing media devices.', err);
		// 	});
		const name = searchParams.get("name");
		const url = `${import.meta.env.VITE_API_URL}/rooms/${roomID}?name=${name}`;
		const newSocket = new WebSocket(url);

		newSocket.onmessage = (event) => {
			const wsMessage: WSMessage = JSON.parse(event.data)

			console.log("Received from server: ", wsMessage);

			wsMessageHandler(wsMessage)
		}; 
		
		newSocket.onclose = () => { 
			alert("WebSocket connection closed");
			navigate("/");
		};

		setSocket(newSocket);

		// TODO: Add WebRTC or WebSocket logic to display the remote stream in remoteVideoRef
	
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	const wsMessageHandler = (wsMessage: WSMessage) => {
		switch(wsMessage.type) {
			case "chat":

		}
	}

	return (
		<div className="flex flex-col h-screen">
			<Navbar roomID={roomID} />
			<div className="flex flex-1">
				{/* Main video section */}
				<div className="flex-1 bg-gray-800 flex flex-col justify-center items-center relative">
					{/* Remote video */}
					<video
						ref={remoteVideoRef}
						className="w-full h-full object-cover"
						autoPlay
						playsInline
						muted
					></video>

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
						<div className="flex-grow overflow-y-auto p-2 bg-gray-100 rounded mb-4">
							{/* Chat messages would go here */}
							<div className="message">
								<span className="font-semibold">User 1:</span> Hello!
							</div>
							<div className="message">
								<span className="font-semibold">User 2:</span> Hi there!
							</div>
						</div>

						<div className="flex">
							<input
								type="text"
								placeholder="Type your message..."
								className="flex-grow p-2 border rounded-l-md focus:outline-none"
							/>
							<button className="p-2 bg-blue-600 text-white rounded-r-md">Send</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Conference