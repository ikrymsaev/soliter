import React from "react";
import { Game } from "../core/Game";
import { GameCmp } from "./GameCmp";
import { EventEmitterProvider } from "../core/react/providers/EventEmitterProvider";
import { ControllerProvider } from "../core/react/providers/ControllerProvider";
import { ESolitaireRules } from "../core/rules/GameRulesFactory";

interface GameScreenProps {
  game: Game;
  onBackToMenu: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({ game, onBackToMenu }) => {
  const getGameName = (rulesType: ESolitaireRules) => {
    switch (rulesType) {
      case ESolitaireRules.CLASSIC:
        return "Классический пасьянс";
      case ESolitaireRules.KLONDIKE:
        return "Косынка";
      default:
        return "Пасьянс";
    }
  };

  return (
    <div className="min-h-screen bg-emerald-700">
      {/* Заголовок с кнопкой возврата */}
      <div className="bg-emerald-800 p-2 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">
            {getGameName(game.rulesType)}
          </h1>
          
          <button
            onClick={onBackToMenu}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-1 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Вернуться к выбору</span>
          </button>
        </div>
      </div>

      {/* Игровое поле */}
      <div className="flex-1">
        <EventEmitterProvider>
          <ControllerProvider game={game}>
            <GameCmp game={game} />
          </ControllerProvider>
        </EventEmitterProvider>
      </div>
    </div>
  );
};
