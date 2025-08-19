import React from "react";
import { ESolitaireRules } from "@/core/rules/GameRulesFactory";

interface GameSelectorProps {
  onGameSelect: (gameType: ESolitaireRules) => void;
}

export const GameSelector: React.FC<GameSelectorProps> = ({ onGameSelect }) => {
  return (
    <div className="min-h-screen bg-emerald-700 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-4 max-w-md w-full mx-4">
        <h1 className="text-3xl font-bold text-center text-emerald-800 mb-8">
          Выберите пасьянс
        </h1>
        
        <div className="space-y-4">
          <button
            onClick={() => onGameSelect(ESolitaireRules.CLASSIC)}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-3"
          >
            <div className="w-8 h-12 bg-white rounded border-2 border-gray-300 flex items-center justify-center">
              <span className="text-emerald-600 text-xs font-bold">♠</span>
            </div>
            <span className="text-lg">Классический пасьянс</span>
          </button>
          
          <button
            onClick={() => onGameSelect(ESolitaireRules.KLONDIKE)}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-3"
          >
            <div className="w-8 h-12 bg-blue-600 rounded border-2 border-blue-800 flex items-center justify-center">
              <span className="text-white text-xs font-bold">♠</span>
            </div>
            <span className="text-lg">Косынка</span>
          </button>
        </div>
        
        <div className="mt-8 text-center text-gray-600 text-sm">
          <p className="mb-2">
            <strong>Классический пасьянс:</strong> 8 колонок, временные слоты
          </p>
          <p>
            <strong>Косынка:</strong> 7 колонок, карты вытягиваются из колоды
          </p>
        </div>
      </div>
    </div>
  );
};
