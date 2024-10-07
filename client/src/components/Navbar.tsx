import { Link } from "react-router-dom"

const Navbar: React.FC<{ roomID: string | undefined }> = ({ roomID }) => {
	return (
		<nav className="bg-white border-gray-200 dark:bg-gray-900">
			<div className="flex flex-wrap items-center justify-between mx-auto p-4">
				<Link
					to="/"
					className="flex items-center space-x-3 rtl:space-x-reverse"
				>
					<span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
						Konfrens
					</span>
				</Link>
				<div className="flex mt-4 sm:mt-0 space-x-3 md:space-x-4 rtl:space-x-reverse">
					<p className="text-black dark:text-white px-4 py-2">Room ID: {roomID}</p>
				</div>
			</div>
		</nav>
	)
}

export default Navbar