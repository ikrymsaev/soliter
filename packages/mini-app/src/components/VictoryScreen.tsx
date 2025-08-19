import React from "react";

interface VictoryScreenProps {
  onNewGame: () => void;
  onBackToMenu: () => void;
}

export const VictoryScreen: React.FC<VictoryScreenProps> = ({ onNewGame, onBackToMenu }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4 text-center">
        <div className="mb-6">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-emerald-800 mb-2">
            Поздравляем!
          </h1>
          <p className="text-lg text-gray-600">
            Вы успешно завершили пасьянс!
          </p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={onNewGame}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Новая игра
          </button>
          
          <button
            onClick={onBackToMenu}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Вернуться к выбору
          </button>
        </div>
      </div>
    </div>
  );
};
