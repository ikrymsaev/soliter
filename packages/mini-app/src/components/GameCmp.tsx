import React from "react";
import { Game } from "../core/Game";
import { useController } from "../core/react/hooks/useController";
import { useGameState } from "../core/react/hooks/useGameState";
import { VictoryScreen } from "./VictoryScreen";
import { ClassicLayout } from "./Layouts/ClassicLayout";
import { KlondikeLayout } from "./Layouts/KlondikeLayout";
import { ESolitaireRules } from "../core/rules/GameRulesFactory";

interface GameCmpProps {
  game: Game;
  onNewGame?: () => void;
  onBackToMenu?: () => void;
}

export const GameCmp: React.FC<GameCmpProps> = ({ game, onNewGame, onBackToMenu }) => {
  const controller = useController();
  const { isWon } = useGameState();

  const handleOutsideClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('[data-card]') && !target.closest('[data-slot]')) {
      controller.setSelectedCard(null);
    }
  };

  const handleGameDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleGameDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleGameDragEnd = (e: React.DragEvent) => {
    e.preventDefault();
    const cardData = e.dataTransfer.getData('text/plain');
    if (cardData) {
      const allSlots = game.getAllSlots();
      let foundCard = null;
      
      for (const column of allSlots.columns) {
        const cards = column.getCards();
        foundCard = cards.find(card => card.getDisplayName() === cardData);
        if (foundCard) break;
      }
      
      if (!foundCard) {
        for (const card of allSlots.temp.getCards()) {
          if (card.getDisplayName() === cardData) {
            foundCard = card;
            break;
          }
        }
      }
      
      if (!foundCard) {
        for (const slot of allSlots.result) {
          for (const card of slot.getCards().get()) {
            if (card.getDisplayName() === cardData) {
              foundCard = card;
              break;
            }
          }
          if (foundCard) break;
        }
      }
      
      if (!foundCard && allSlots.drawnCardsArea) {
        const drawnCards = allSlots.drawnCardsArea.getCards();
        foundCard = drawnCards.find(card => card.getDisplayName() === cardData);
      }
      
      if (foundCard) {
        controller.setSelectedCard(null);
      }
    }
  };

  return (
    <div
      className="flex flex-col p-10 gap-10"
      onClick={handleOutsideClick}
      onDragEnter={handleGameDragEnter}
      onDragOver={handleGameDragOver}
      onDragEnd={handleGameDragEnd}
    >
      <GameLayout game={game} />
      <ClicksState />
      
      {/* Экран победы */}
      {isWon && onNewGame && onBackToMenu && (
        <VictoryScreen 
          onNewGame={onNewGame}
          onBackToMenu={onBackToMenu}
        />
      )}
    </div>
  );
};

const GameLayout = ({ game }: { game: Game }) => {
  const Layout = {
    [ESolitaireRules.CLASSIC]: ClassicLayout,
    [ESolitaireRules.KLONDIKE]: KlondikeLayout,
  }[game.rulesType];
  return <Layout />;
};

const ClicksState = () => {
  const controller = useController();
  const clicks = controller.clicks.get();
  const selectedCard = controller.selectedCard.get();

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded text-xs">
      <div>Clicks: {clicks}</div>
      <div>Selected: {selectedCard ? selectedCard.getDisplayName() : 'none'}</div>
    </div>
  );
};