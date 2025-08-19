import { useEffect } from "react";
import { useObserve } from "./useObserve";
import { useController } from "./useController";
import { observable, type IObservable } from "../../lib/Observable";

// Observable для состояния игры
const gameStateObservable = observable<{
  isCompleted: boolean;
  isWon: boolean;
}>({
  isCompleted: false,
  isWon: false
});

// Функция для обновления состояния игры
export const updateGameState = (isCompleted: boolean, isWon: boolean) => {
  gameStateObservable.set({ isCompleted, isWon });
};

// Хук для получения состояния игры
export const useGameState = () => {
  const controller = useController();
  const gameState = useObserve(gameStateObservable);
  
  // Проверяем состояние игры при инициализации
  useEffect(() => {
    const checkGameState = () => {
      const isCompleted = controller.isGameCompleted();
      const isWon = isCompleted; // В пасьянсе победа = завершение игры
      
      updateGameState(isCompleted, isWon);
    };
    
    checkGameState();
  }, [controller]);
  
  return gameState;
};
