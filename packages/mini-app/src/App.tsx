import { useState } from "react";
import { Game } from "./core/Game";
import { GameSelector } from "./components/GameSelector";
import { GameScreen } from "./components/GameScreen";
import { ESolitaireRules } from "./core/rules/GameRulesFactory";

type AppState = 'selector' | 'game';

function App() {
  const [currentState, setCurrentState] = useState<AppState>('selector');
  const [currentGame, setCurrentGame] = useState<Game | null>(null);

  const handleGameSelect = (gameType: ESolitaireRules) => {
    const newGame = new Game(gameType);
    setCurrentGame(newGame);
    setCurrentState('game');
  };

  const handleBackToMenu = () => {
    setCurrentState('selector');
    setCurrentGame(null);
  };

  if (currentState === 'selector') {
    return <GameSelector onGameSelect={handleGameSelect} />;
  }

  if (currentState === 'game' && currentGame) {
    return <GameScreen game={currentGame} onBackToMenu={handleBackToMenu} />;
  }

  return <GameSelector onGameSelect={handleGameSelect} />;
}

export default App;
