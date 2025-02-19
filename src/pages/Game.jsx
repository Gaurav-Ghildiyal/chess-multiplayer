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
  const [isWaiting, setIsWaiting] = useState(true);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [possibleMoves, setPossibleMoves] = useState([]);
  const [resigned, setResigned] = useState(false);

  useEffect(() => {
    const roomRef = ref(database, `rooms/${roomId}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;
      try {
        setGame(new Chess(data.fen || Chess.DEFAULT_POSITION));
      } catch {
        update(roomRef, { fen: new Chess(Chess.DEFAULT_POSITION).fen() });
      }
      setTurn(data.turn || "white");
      setWinner(data.winner || null);
      setSelectedSquare(null);
      setPossibleMoves([]);
      if (data.player1 && data.player2) {
        const isPlayer1 = data.player1.name === playerName;
        setPlayerColor(isPlayer1 ? "white" : "black");
        setOpponentName(isPlayer1 ? data.player2.name : data.player1.name);
        setIsWaiting(false);
      } else {
        setIsWaiting(true);
      }

      // If both players have left, delete the room
      if (!data.player1 && !data.player2) {
        remove(ref(database, `rooms/${roomId}`));
      }
    });
    return () => unsubscribe();
  }, [roomId, playerName]);

  const handleMove = async (sourceSquare, targetSquare) => {
    if (winner || !playerColor || game.turn() !== playerColor[0]) return false;
    try {
      const newGame = new Chess(game.fen());
      const move = newGame.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
      if (!move) return false;
      setSelectedSquare(null);
      setPossibleMoves([]);
      await update(ref(database, `rooms/${roomId}`), {
        fen: newGame.fen(),
        turn: newGame.turn() === "w" ? "white" : "black",
        winner: newGame.isGameOver() ? (newGame.isCheckmate() ? playerName : "Draw") : null,
      });
      return true;
    } catch {
      return false;
    }
  };

  const handlePieceClick = (square) => {
    if (winner || !playerColor || game.turn() !== playerColor[0]) return;
    const piece = game.get(square);
    if (!piece || piece.color !== playerColor[0]) return;
    const moves = game.moves({ square, verbose: true });
    setSelectedSquare(square);
    setPossibleMoves(moves.map(move => move.to));
  };

  const resignGame = async () => {
    if (!winner) {
      await update(ref(database, `rooms/${roomId}`), { winner: opponentName });
      setResigned(true);
    }
  };

  const leaveGame = async () => {
    await update(ref(database, `rooms/${roomId}`), {
      [playerColor === "white" ? "player1" : "player2"]: null
    });
    navigate("/");
  };

  const playAgain = async () => {
    await update(ref(database, `rooms/${roomId}`), {
      fen: new Chess().fen(),
      winner: null,
      turn: "white",
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-200 p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg text-center">
        <h1 className="text-2xl font-bold text-gray-800">Room: {roomId}</h1>
        <p className="text-lg text-gray-600">{playerName} ({playerColor || "waiting..."}) vs {opponentName || "Waiting..."}</p>
        {isWaiting && <p className="text-blue-500 mt-2">Waiting for another player to join...</p>}
        {winner ? (
          <>
            <h2 className="text-xl font-bold text-green-600 mt-2">Game Over! Winner: {winner}</h2>
            <button className="px-4 py-2 bg-blue-500 text-white rounded mt-4" onClick={playAgain}>Play Again</button>
          </>
        ) : null}
        <Chessboard 
          position={game.fen()} 
          onPieceDrop={handleMove} 
          onPieceClick={handlePieceClick} 
          boardWidth={400} 
          customSquareStyles={{
            ...(selectedSquare ? { [selectedSquare]: { backgroundColor: "rgba(255,255,0,0.6)" } } : {}),
            ...possibleMoves.reduce((acc, move) => {
              acc[move] = { backgroundColor: "rgba(0,255,0,0.4)" };
              return acc;
            }, {})
          }}
        />
        <div className="flex gap-4 mt-4">
          <button className="px-4 py-2 bg-red-500 text-white rounded" onClick={resignGame} disabled={winner}>Resign</button>
          <button className="px-4 py-2 bg-gray-500 text-white rounded" onClick={leaveGame}>Leave</button>
        </div>
      </div>
    </div>
  );
};

export default Game;