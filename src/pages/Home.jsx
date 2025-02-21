import { useState } from "react";
import { database } from "../firebaseConfig";
import { ref, set, get, update } from "firebase/database";
import { useNavigate } from "react-router-dom";
import board from "../assets/board.png";
import { FaChessKnight } from "react-icons/fa";

const Home = () => {
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const navigate = useNavigate();

  // Create a new room
  const createRoom = async () => {
    if (!playerName) {
      alert("Please enter your name first!");
      return;
    }

    const code = Math.floor(1000 + Math.random() * 9000).toString();
    
    await set(ref(database, `rooms/${code}`), {
      player1: { name: playerName, color: "white" },
      player2: null,
      turn: "white",
      fen: "", // Initial FEN for chess state
    });

    navigate(`/game/${code}?name=${playerName}`);
  };

  // Handle join room logic
  const handleJoinRoomClick = () => {
    if (!playerName) {
      alert("Please enter your name first!");
      return;
    }
    setIsJoining(true); // Show the room code input box
  };

  const joinRoom = async () => {
    if (!roomCode) {
      alert("Please enter the 4-digit room code!");
      return;
    }

    const roomRef = ref(database, `rooms/${roomCode}`);
    const roomSnapshot = await get(roomRef);
    const roomData = roomSnapshot.val();

    if (!roomData) {
      alert("Room does not exist!");
      return;
    }

    if (roomData.player2) {
      alert("Room is already full!");
      return;
    }

    await update(roomRef, {
      player2: { name: playerName, color: "black" },
    });

    navigate(`/game/${roomCode}?name=${playerName}`);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FaChessKnight size={24} />
          <span className="text-lg font-semibold">Multiplayer Chess</span>
        </div>
        <button className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700">
          Account Settings
        </button>
      </nav>

      {/* Main Content */}
      <div className="flex flex-grow">
        {/* Left Side - Chess Board */}
        <div className="flex items-center justify-center w-1/2">
          <img src={board} alt="Chess Board" className="h-96 w-96" />
        </div>

        {/* Right Side - Room Options */}
        <div className="flex flex-col justify-center items-center w-1/2">
          <div className="bg-white shadow-lg rounded-lg p-6 w-80 text-center">
            <h1 className="text-2xl font-semibold mb-4">Join or Create a Room</h1>

            {/* Name Input */}
            <input
              type="text"
              placeholder="Enter Your Name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="border p-2 w-full rounded mb-3"
            />

            {/* Buttons */}
            <button
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition mb-3"
              onClick={createRoom}
            >
              Create Room
            </button>

            <button
              className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
              onClick={handleJoinRoomClick}
            >
              Join Room
            </button>

            {/* Room Code Input (Only shows if Join Room is clicked) */}
            {isJoining && (
              <>
                <div className="my-4 border-t"></div> {/* Divider */}
                <input
                  type="text"
                  placeholder="Enter 4-digit Room Code"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  className="border p-2 w-full rounded mb-3"
                />
                <button
                  className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                  onClick={joinRoom}
                >
                  Enter Room
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
