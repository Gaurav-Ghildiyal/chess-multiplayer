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
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <img src={board} alt="Chess Board" />
      <input
        type="text"
        placeholder="Enter Your Name"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        className="border p-2"
      />
      <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={createRoom}>
        Create Room
      </button>
      <input
        type="text"
        placeholder="Enter 4-digit Code"
        value={roomCode}
        onChange={(e) => setRoomCode(e.target.value)}
        className="border p-2"
      />
      <button className="px-4 py-2 bg-green-500 text-white rounded" onClick={joinRoom}>
        Join Room
      </button>
    </div>
  );
};

export default Home;
