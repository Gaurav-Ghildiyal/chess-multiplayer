const stockfish = new Worker("stockfish.js"); // Uses Stockfish Web Worker

export const getBestMove = (fen, level, callback) => {
  stockfish.postMessage("uci"); // Initialize Stockfish
  stockfish.postMessage(`setoption name Skill Level value ${level}`); // Set AI level
  stockfish.postMessage(`position fen ${fen}`);
  stockfish.postMessage("go depth 10"); // Higher depth = stronger AI

  stockfish.onmessage = (event) => {
    if (event.data.includes("bestmove")) {
      const bestMove = event.data.split("bestmove ")[1].split(" ")[0];
      callback(bestMove);
    }
  };
};
