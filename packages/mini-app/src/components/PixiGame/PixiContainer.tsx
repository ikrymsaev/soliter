import { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";
import { GameScene } from "./GameScene";
import type { Game } from "@/core/Game";
import type { Controller } from "@/core/GameController";
import type { EventEmitter } from "@/core/lib/EventEmitter";
import { UIController } from "./UIController";


export const PixiContainer = ({ game, controller, eventEmitter }: { game: Game, controller: Controller, eventEmitter: EventEmitter }) => {
    const appRef = useRef<PIXI.Application | null>(null);
    const uiEmitter = useRef(new PIXI.EventEmitter())

    useEffect(() => {
        initPixi(game, controller, eventEmitter, uiEmitter.current);
        
        // Очистка при размонтировании
        return () => {
            if (appRef.current) {
                appRef.current.destroy(true);
                appRef.current = null;
            }
        };
    }, [game, controller, eventEmitter, uiEmitter]);

    return (
        <div id="pixi-container-wrapper" className="flex-1 min-w-4xl max-w-4xl min-h-2xl max-h-2xl mx-auto">
            <div id={CONTAINER_ID} />
        </div>
    )
}

const CONTAINER_ID = 'pixi-container';

const initPixi = async (
    game: Game,
    controller: Controller,
    eventEmitter: EventEmitter,
    pixiEmitter: PIXI.EventEmitter
) => {
    const app = new PIXI.Application();
    const containerWrapper = document.getElementById('pixi-container-wrapper')!;
    await app.init({ 
        backgroundAlpha: 0, 
        resizeTo: containerWrapper,
    });
    const container = document.getElementById(CONTAINER_ID)!;
    container.innerHTML = '';
    container.appendChild(app.canvas);
    
    const uiController = new UIController(game, app.stage, eventEmitter, pixiEmitter, controller);

    const gameScene = new GameScene(game, controller, uiController, eventEmitter, pixiEmitter);
    app.stage.addChild(gameScene);
}