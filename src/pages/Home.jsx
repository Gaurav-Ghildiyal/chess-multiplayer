import { useState } from "react";
import { database } from "../firebaseConfig";
import { ref, set, get, update } from "firebase/database";
import { useNavigate } from "react-router-dom";
import board from "../assets/board.png";
import { FaChessKnight } from "react-icons/fa";
import { Chess } from "chess.js";

const Home = () => {
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [timeControl, setTimeControl] = useState("unlimited");
  const navigate = useNavigate();

  const createRoom = async () => {
    if (!playerName) {
      alert("Please enter your name first!");
      return;
    }

    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const isTimed = timeControl !== "unlimited";
    
    await set(ref(database, `rooms/${code}`), {
      player1: { name: playerName, color: "white" },
      player2: null,
      turn: "white",
      fen: new Chess().fen(),
      timeControl: timeControl,
      timers: isTimed ? {
        white: parseInt(timeControl),
        black: parseInt(timeControl)
      } : null
    });

    navigator.clipboard.writeText(code);
    navigate(`/game/${code}?name=${playerName}`);
  };

  const handleJoinRoomClick = () => {
    if (!playerName) {
      alert("Please enter your name first!");
      return;
    }
    setIsJoining(true);
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
    <div className="relative flex flex-col h-screen bg-gray-100 md:bg-none">
      <div className="absolute inset-0 bg-cover bg-center md:hidden" style={{ backgroundImage: `url(${board})`, filter: "blur(8px)" }}></div>

      <nav className="relative bg-blue-600 text-white p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FaChessKnight size={24} />
          <span className="text-lg font-semibold">Multiplayer Chess</span>
        </div>
        <button className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700">
          Account Settings
        </button>
      </nav>

      <div className="relative flex flex-col items-center justify-center flex-grow p-4 md:flex-row">
        <div className="hidden md:flex justify-center w-full md:w-1/2 mb-4 md:mb-0">
          <img src={board} alt="Chess Board" className="w-80 md:w-96" />
        </div>

        <div className="relative flex flex-col justify-center items-center w-full md:w-1/2">
          <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-xs text-center">
            <h1 className="text-xl md:text-2xl font-semibold mb-4">Join or Create a Room</h1>

            <input
              type="text"
              placeholder="Enter Your Name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="border p-2 w-full rounded mb-3 text-lg"
            />

            <div className="w-full mb-3">
              <select
                value={timeControl}
                onChange={(e) => setTimeControl(e.target.value)}
                className="border p-2 w-full rounded text-lg"
              >
                <option value="unlimited">Unlimited Time</option>
                <option value="300">5 Minutes</option>
                <option value="600">10 Minutes</option>
              </select>
            </div>

            <button
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-lg mb-3"
              onClick={createRoom}
            >
              Create Room
            </button>

            <button
              className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition text-lg"
              onClick={handleJoinRoomClick}
            >
              Join Room
            </button>

            {isJoining && (
              <>
                <div className="my-4 border-t"></div>
                <input
                  type="text"
                  placeholder="Enter 4-digit Room Code"
                  value={roomCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setRoomCode(value.slice(0, 4));
                  }}
                  className="border p-2 w-full rounded mb-3 text-lg"
                  inputMode="numeric"
                />
                <button
                  className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition text-lg"
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