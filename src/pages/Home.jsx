import { useState } from "react";
import { database } from "../firebaseConfig";
import { ref, set, get, update } from "firebase/database";
import { useNavigate } from "react-router-dom";
import board from "../assets/board.png";


const Home = () => {
  const [roomCode, setRoomCode] = useState("");
  const [playerName, setPlayerName] = useState("");
  const navigate = useNavigate();

  // Generate a 4-digit random room code
  const createRoom = async () => {
    if (!playerName) {
      alert("Enter your name to create a room!");
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

  // Join an existing room
 const joinRoom = async () => {
  if (!playerName) {
    alert("Enter your name to join a room!");
    return;
  }

  const roomRef = ref(database, `rooms/${roomCode}`);
  const roomSnapshot = await get(roomRef);
  const roomData = roomSnapshot.val();

  if (!roomData) {
    alert("Room does not exist!");
    return;
  }

  // Make sure player 2 is joining the room and update the room with player2 info
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
  <div className="flex h-screen bg-gray-100">
    {/* Left Side - Chess Board */}
    <div className="flex items-center justify-center w-1/2">
      <img src={board} alt="Chess Board" className="h-96 w-96" />
    </div>

    {/* Right Side - Room Creation & Joining */}
    <div className="flex flex-col justify-center items-center w-1/2">
      <div className="bg-white shadow-lg rounded-lg p-6 w-80 text-center">
        <h1 className="text-2xl font-semibold mb-4">Multiplayer Chess</h1>

        {/* Name Input */}
        <input
          type="text"
          placeholder="Enter Your Name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          className="border p-2 w-full rounded mb-3"
        />

        {/* Create Room Button */}
        <button
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          onClick={createRoom}
        >
          Create Room
        </button>

        <div className="my-4 border-t"></div> {/* Divider */}

        {/* Room Code Input */}
        <input
          type="text"
          placeholder="Enter 4-digit Code"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
          className="border p-2 w-full rounded mb-3"
        />

        {/* Join Room Button */}
        <button
          className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
          onClick={joinRoom}
        >
          Join Room
        </button>
      </div>
    </div>
  </div>
);
};

export default Home;
