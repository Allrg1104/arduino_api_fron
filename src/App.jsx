import React, { useEffect, useState } from "react";
import "./app.css";

export default function App() {
  const [board, setBoard] = useState(Array(3).fill(null).map(() => Array(3).fill("")));
  const [cursor, setCursor] = useState({ row: 0, col: 0 });
  const [turn, setTurn] = useState("X");
  const [lastDatoId, setLastDatoId] = useState(null);

  // Jugador 1 (teclado)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (turn !== "X") return;
      moveCursor(e.key);
      if (e.key === "Enter" || e.key === " ") playTurn();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cursor, turn]);

  // Jugador 2 (Arduino)
  useEffect(() => {
    const interval = setInterval(fetchArduinoInput, 1000);
    return () => clearInterval(interval);
  }, [cursor, turn]);

  const fetchArduinoInput = async () => {
    try {
      //const res = await fetch("https://arduino-api-back.vercel.app/api/datos");
      const res = await fetch("http://localhost:3000/api/datos");
      const data = await res.json();
      if (data.length === 0) return;

      const ultimo = data[data.length - 1];
      const dato = ultimo.dato.toLowerCase().trim();

      if (turn === "O") {
        setLastDatoId(ultimo._id);
        console.log("📲 Arduino presionó:", dato);
        handleArduinoInput(dato);
      }
    } catch (err) {
      console.error("❌ Error obteniendo dato del Arduino:", err);
    }
  };

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
      const newBoard = prevBoard.map((r) => [...r]);
      const { row, col } = cursor;
      if (newBoard[row][col] === "") {
        newBoard[row][col] = turn;
        setTurn(turn === "X" ? "O" : "X");
      }
      return newBoard;
    });
  };

  const handleArduinoInput = (inputRaw) => {
    const mapTeclas = {
      a: "arriba",
      b: "abajo",
      c: "izquierda",
      d: "derecha",
      s: "select", // Para el botón "SELECT"
    };

    const input = mapTeclas[inputRaw] || inputRaw;

    if (!["arriba", "abajo", "izquierda", "derecha", "select"].includes(input)) return;

    if (input === "select") {
      playTurn();
    } else {
      moveCursor(input);
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
              className={`triqui-cell ${cursor.row === i && cursor.col === j ? "cursor" : ""}`}
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
