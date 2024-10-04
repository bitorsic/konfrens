import { useState } from "react";

const Landing: React.FC = () => {
	const [roomID, setRoomID] = useState<string>("")

	const createRoom = async () => {
		console.log("Create Room")
	}

	return (
		<section className="flex flex-col items-center justify-center px-6 py-8 mx-auto min-h-screen lg:py-0 bg-gray-50 dark:bg-gray-900">
			<h1 className="text-gray-900 text-6xl font-bold py-12 dark:text-white">
				Konfrens
			</h1>
			<div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
				<div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
					<div className="grid grid-flow-row align-middle p-6 space-y-4 md:space-y-6 sm:p-8">
						<button
							onClick={createRoom}
							className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
						>
							Create Room
						</button>
						<div className="grid grid-flow-col space-x-4">
							<input
								type="text"
								name="room-id"
								id="room-id"
								placeholder="Room ID"
								value={roomID}
								onChange={(e) => setRoomID(e.target.value)}
								className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
							/>
							<button 
								// onClick={sendMessage}
								className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
							>
								Join Room
							</button>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Landing;
