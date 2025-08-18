import { Game } from "./core/Game";
import { GameCmp } from "./components/GameCmp";
import { EventEmitterProvider } from "./core/react/providers/EventEmitterProvider";
import { ControllerProvider } from "./core/react/providers/ControllerProvider";

const game = new Game();

function App() {
  return (
      <div className="flex flex-col">
        <EventEmitterProvider>
          <ControllerProvider game={game}>
            <GameCmp game={game} />
          </ControllerProvider>
        </EventEmitterProvider>
      </div>
  )
}

export default App
