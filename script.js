// 1. Factory Function for Players
const createPlayer = (name, marker) => {
  return { name, marker };
};

// 2. Gameboard Module (Singleton)
const Gameboard = (() => {
  let board = ["", "", "", "", "", "", "", "", ""];
  const getBoard = () => board;

  const setCell = (index, marker) => {
    if (board[index] === "") {
      board[index] = marker;
      return true;
    }
    return false;
  };

  const resetBoard = () => {
    board = ["", "", "", "", "", "", "", "", ""];
  };

  return { getBoard, setCell, resetBoard };
})();

// 3. Game Controller Module (Singleton)
const GameController = (() => {
  let playerX = createPlayer("Player X", "X");
  let playerO = createPlayer("Player O", "O");
  let activePlayer = playerX;
  let isGameOver = false;

  const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // Rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // Columns
    [0, 4, 8],
    [2, 4, 6], // Diagonals
  ];

  const setPlayers = (nameX, nameO) => {
    playerX = createPlayer(nameX || "Player X", "X");
    playerO = createPlayer(nameO || "Player O", "O");
    activePlayer = playerX;
  };

  const switchTurn = () => {
    activePlayer = activePlayer === playerX ? playerO : playerX;
  };

  const getActivePlayer = () => activePlayer;

  const checkWinner = () => {
    const board = Gameboard.getBoard();
    for (let combo of winningCombinations) {
      const [a, b, c] = combo;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    if (!board.includes("")) return "Tie";
    return null;
  };

  const playRound = (index) => {
    if (isGameOver) return null;

    const validMove = Gameboard.setCell(index, activePlayer.marker);
    if (!validMove) return null;

    const winner = checkWinner();
    if (winner) {
      isGameOver = true;
      return {
        status: "win",
        winner: winner === "Tie" ? "Tie" : activePlayer,
      };
    }

    switchTurn();
    return { status: "continue", nextPlayer: activePlayer };
  };

  const resetGame = () => {
    Gameboard.resetBoard();
    activePlayer = playerX;
    isGameOver = false;
  };

  return { setPlayers, playRound, getActivePlayer, resetGame };
})();

// 4. Display Controller Module (Singleton)
const DisplayController = (() => {
  // DOM Elements
  const setupScreen = document.getElementById("setupScreen");
  const gameScreen = document.getElementById("gameScreen");
  const startBtn = document.getElementById("startBtn");
  const restartBtn = document.getElementById("restartBtn");
  const changeNamesBtn = document.getElementById("changeNamesBtn");
  const playerXInput = document.getElementById("playerXName");
  const playerOInput = document.getElementById("playerOName");
  const cells = document.querySelectorAll(".cell");
  const statusText = document.getElementById("statusText");
  const resultsBanner = document.getElementById("resultsBanner");
  const resultMessage = document.getElementById("resultMessage");

  const render = () => {
    const currentBoard = Gameboard.getBoard();
    cells.forEach((cell, index) => {
      cell.textContent = currentBoard[index];
      cell.className = "cell";
      if (currentBoard[index] === "X") cell.classList.add("x");
      if (currentBoard[index] === "O") cell.classList.add("o");
    });
  };

  const handleCellClick = (e) => {
    const index = parseInt(e.target.dataset.index);
    const result = GameController.playRound(index);

    if (!result) return;

    render();

    if (result.status === "win") {
      resultsBanner.classList.remove("hidden");
      if (result.winner === "Tie") {
        resultMessage.textContent = "It's a Tie Game!";
        statusText.textContent = "Game Over";
      } else {
        resultMessage.textContent = `🎉 ${result.winner.name} Wins!`;
        statusText.textContent = "Victory!";
      }
    } else {
      statusText.textContent = `${result.nextPlayer.name}'s Turn (${result.nextPlayer.marker})`;
    }
  };

  // Event Listeners
  startBtn.addEventListener("click", () => {
    const nameX = playerXInput.value.trim();
    const nameO = playerOInput.value.trim();

    GameController.setPlayers(nameX, nameO);
    setupScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    resultsBanner.classList.add("hidden");

    GameController.resetGame();
    render();
    statusText.textContent = `${nameX || "Player X"}'s Turn (X)`;
  });

  restartBtn.addEventListener("click", () => {
    GameController.resetGame();
    resultsBanner.classList.add("hidden");
    render();
    statusText.textContent = `${GameController.getActivePlayer().name}'s Turn (${GameController.getActivePlayer().marker})`;
  });

  changeNamesBtn.addEventListener("click", () => {
    gameScreen.classList.add("hidden");
    setupScreen.classList.remove("hidden");
    GameController.resetGame();
    resultsBanner.classList.add("hidden");
  });

  cells.forEach((cell) => cell.addEventListener("click", handleCellClick));
})();
