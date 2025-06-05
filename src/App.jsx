import React, { useEffect, useState } from "react";
import "./styles/triqui.css"; // 👈 Importamos el CSS externo

export default function App() {
  const [board, setBoard] = useState(Array(3).fill(null).map(() => Array(3).fill("")));
  const [cursor, setCursor] = useState({ row: 0, col: 0 });
  const [turn, setTurn] = useState("X");
  const [lastArduinoButton, setLastArduinoButton] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (turn !== "X") return;
      moveCursor(e.key);
      if (e.key === "Enter" || e.key === " ") playTurn();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cursor, turn]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("https://arduino-back.vercel.app/api/datos");
        const data = await res.json();
        if (data.length === 0) return;
        const ultimo = data[data.length - 1].dato;
        if (ultimo !== lastArduinoButton) {
          setLastArduinoButton(ultimo);
          handleArduinoInput(ultimo);
        }
      } catch (err) {
        console.error("Error leyendo datos del Arduino:", err.message);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [cursor, turn, lastArduinoButton]);

  const moveCursor = (key) => {
    setCursor((prev) => {
      let { row, col } = prev;
      if (key === "ArrowUp" || key === "arriba") row = (row + 2) % 3;
      if (key === "ArrowDown" || key === "abajo") row = (row + 1) % 3;
      if (key === "ArrowLeft" || key === "izquierda") col = (col + 2) % 3;
      if (key === "ArrowRight" || key === "derecha") col = (col + 1) % 3;
      return { row, col };
    });
  };

  const playTurn = () => {
    setBoard((prevBoard) => {
      const newBoard = prevBoard.map((row) => [...row]);
      const { row, col } = cursor;
      if (newBoard[row][col] === "") {
        newBoard[row][col] = turn;
        setTurn(turn === "X" ? "O" : "X");
      }
      return newBoard;
    });
  };

  const handleArduinoInput = (input) => {
    if (turn !== "O") return;
    switch (input.toLowerCase()) {
      case "arriba":
      case "abajo":
      case "izquierda":
      case "derecha":
        moveCursor(input.toLowerCase());
        break;
      case "select":
        playTurn();
        break;
      default:
        break;
    }
  };

  return (
    <div className="triqui-container">
      <h1 className="triqui-title">Triqui (2 Jugadores)</h1>
      <p className="triqui-turno">
        Turno: {turn === "X" ? "Jugador 1 (PC)" : "Jugador 2 (Arduino)"}
      </p>

      <div className="triqui-grid">
        {board.map((row, i) =>
          row.map((cell, j) => (
            <div
              key={`${i}-${j}`}
              className={`triqui-cell ${
                cursor.row === i && cursor.col === j ? "cursor" : ""
              }`}
            >
              {cell}
            </div>
          ))
        )}
      </div>

      <p className="triqui-info">
        🎮 Jugador 1: Flechas + Enter | 🤖 Jugador 2: Arduino Keypad
      </p>
    </div>
  );
}

