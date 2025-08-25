import React from "react";
import { Game } from "../core/Game";
import { useController } from "../core/react/hooks/useController";
import { PixiContainer } from "./PixiGame/PixiContainer";
import { useEventEmitter } from "@/core/react/hooks";

interface GameCmpProps {
  game: Game;
  onNewGame?: () => void;
  onBackToMenu?: () => void;
}

export const GameCmp: React.FC<GameCmpProps> = ({ game }) => {
  const controller = useController();
  const eventEmitter = useEventEmitter();

  return (
    <>
      <PixiContainer game={game} controller={controller} eventEmitter={eventEmitter} />
    </>
  );
};
