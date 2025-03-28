import { useState } from "react";
import { GameState, MoveState } from "../utils";

export function useKonami(gameState: number) {
  const CODE = [
    MoveState.UP,
    MoveState.UP,
    MoveState.DOWN,
    MoveState.DOWN,
    MoveState.LEFT,
    MoveState.RIGHT,
    MoveState.LEFT,
    MoveState.RIGHT,
  ];
  const [konami, setKonami] = useState(false);
  const [sequence, setSequence] = useState<number[]>([]);

  const updateSequence = (input: number) => {
    if (!konami && gameState === GameState.INTRO) {
      const newSequence = sequence.concat(input);
      if (newSequence.length > CODE.length) {
        newSequence.shift();
      }
      if (newSequence.join(",") === CODE.join(",")) {
        setKonami(true);
        console.log("Slow motion activated!");
      } else {
        setSequence(newSequence);
      }
    }
  };

  return { konami, updateSequence };
}