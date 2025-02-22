import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { database } from "../firebaseConfig";
import { ref, onValue, update, remove } from "firebase/database";
import { Chessboard } from 'react-chessboard';
import { Chess } from "chess.js";

const Game = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const playerName = queryParams.get("name");

  const [game, setGame] = useState(new Chess());
  const [playerColor, setPlayerColor] = useState(null);
  const [opponentName, setOpponentName] = useState("");
  const [turn, setTurn] = useState("white");
  const [winner, setWinner] = useState(null);
  const [whiteTime, setWhiteTime] = useState(null);
  const [blackTime, setBlackTime] = useState(null);
  const [timerActive, setTimerActive] = useState(false);
  const [boardSize, setBoardSize] = useState(Math.min(window.innerWidth * 0.9, 480));
  const [timeControl, setTimeControl] = useState("unlimited");

  useEffect(() => {
    const handleResize = () => {
      setBoardSize(Math.min(window.innerWidth * 0.9, 480));
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const roomRef = ref(database, `rooms/${roomId}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        navigate("/");
        return;
      }
      
      try {
        setGame(new Chess(data.fen || Chess.DEFAULT_POSITION));
      } catch {
        update(roomRef, { fen: new Chess(Chess.DEFAULT_POSITION).fen() });
      }
      
      setTurn(data.turn || "white");
      setWinner(data.winner || null);
      setWhiteTime(data.timers?.white);
      setBlackTime(data.timers?.black);
      setTimeControl(data.timeControl || "unlimited");
      
      if (data.player1 && data.player2) {
        const isPlayer1 = data.player1?.name === playerName;
        setPlayerColor(isPlayer1 ? "white" : "black");
        setOpponentName(isPlayer1 ? data.player2.name : data.player1.name);
      }

      if (!data.player1 && !data.player2) {
        remove(ref(database, `rooms/${roomId}`));
      }
    });
    return () => unsubscribe();
  }, [roomId, playerName, navigate]);

  useEffect(() => {
    if (timeControl === "unlimited" || !timerActive || winner) return;

    const interval = setInterval(async () => {
      const currentTurn = turn;
      const newTime = (currentTurn === "white" ? whiteTime : blackTime) - 1;

      if (newTime <= 0) {
        await update(ref(database, `rooms/${roomId}`), {
          winner: currentTurn === "white" ? opponentName : playerName
        });
        clearInterval(interval);
        return;
      }

      await update(ref(database, `rooms/${roomId}/timers`), {
        [currentTurn]: newTime
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive, turn, whiteTime, blackTime, timeControl, winner, roomId, opponentName, playerName]);

  const handleMove = async (sourceSquare, targetSquare) => {
    if (winner || !playerColor || game.turn() !== playerColor[0]) return false;
    
    try {
      const newGame = new Chess(game.fen());
      const move = newGame.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
      if (!move) return false;

      await update(ref(database, `rooms/${roomId}`), {
        fen: newGame.fen(),
        turn: newGame.turn() === "w" ? "white" : "black",
        winner: newGame.isGameOver() ? (newGame.isCheckmate() ? playerName : "Draw") : null,
      });

      if (timeControl !== "unlimited" && !timerActive) setTimerActive(true);
      return true;
    } catch {
      return false;
    }
  };

  const formatTime = (seconds) => {
    if (timeControl === "unlimited") return '∞';
    if (typeof seconds !== "number" || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const resignGame = async () => {
    if (!winner) {
      await update(ref(database, `rooms/${roomId}`), { winner: opponentName });
    }
  };

  const leaveGame = async () => {
    await update(ref(database, `rooms/${roomId}`), {
      [playerColor === "white" ? "player1" : "player2"]: null
    });
    navigate("/");
  };

  const playAgain = async () => {
    const initialTime = timeControl === "unlimited" ? null : parseInt(timeControl);
    
    await update(ref(database, `rooms/${roomId}`), {
      fen: new Chess().fen(),
      winner: null,
      turn: "white",
      timers: timeControl !== "unlimited" ? {
        white: initialTime,
        black: initialTime
      } : null
    });

    // Reset local state
    setTimerActive(false);
    setWhiteTime(initialTime);
    setBlackTime(initialTime);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      <div className="flex flex-col md:flex-row items-center gap-8 w-full max-w-4xl">
        <div className="w-full md:flex-1 max-w-[90vw]">
          <Chessboard 
            position={game.fen()} 
            onPieceDrop={handleMove} 
            boardWidth={boardSize}
            boardOrientation={playerColor === "black" ? "black" : "white"}
          />
        </div>

        <div className="w-full md:flex-1 bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg">
          {timeControl !== "unlimited" && (
            <div className="flex justify-between mb-4">
              <div className={`p-2 rounded ${turn === 'white' ? 'bg-yellow-600' : 'bg-gray-700'}`}>
                ⏳ White: {formatTime(whiteTime)}
              </div>
              <div className={`p-2 rounded ${turn === 'black' ? 'bg-yellow-600' : 'bg-gray-700'}`}>
                ⏳ Black: {formatTime(blackTime)}
              </div>
            </div>
          )}

          <h1 className="text-xl md:text-2xl font-bold text-white truncate">Room: {roomId}</h1>
          <p className="text-sm md:text-lg text-gray-400 mt-2 truncate">
            {playerName} ({playerColor || "waiting..."}) vs {opponentName || "Waiting..."}
          </p>
          
          {!playerColor && <p className="text-blue-500 mt-2 text-sm md:text-base">Waiting for opponent...</p>}
          
          {winner && (
            <>
              <h2 className="text-lg md:text-xl font-bold text-green-500 mt-2">Game Over! Winner: {winner}</h2>
              <button 
                className="w-full md:w-auto px-4 py-2 bg-blue-500 text-white rounded mt-4"
                onClick={playAgain}
              >
                Play Again
              </button>
            </>
          )}
          
          <div className="flex flex-col md:flex-row gap-2 mt-4">
            <button 
              className="w-full md:w-auto px-4 py-2 bg-red-500 text-white rounded"
              onClick={resignGame} 
              disabled={winner}
            >
              Resign
            </button>
            <button 
              className="w-full md:w-auto px-4 py-2 bg-gray-600 text-white rounded"
              onClick={leaveGame}
            >
              Leave
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;