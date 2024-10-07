import { useParams } from "react-router-dom"
import Navbar from "../components/Navbar"

const Conference = () => {
	const { roomID } = useParams<{ roomID: string }>()

	return (
		<>
			<Navbar roomID={roomID} />
		</>
	)
}

export default Conference