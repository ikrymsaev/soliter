import type { Game } from "@/core/Game";
import * as PIXI from "pixi.js";
import { FieldBucket } from "./objects/FieldBucket";
import { TempBucket } from "./objects/TempBucket";
import { ResultBucket } from "./objects/ResultBucket";
import { DrawnCards } from "./objects/DrawnCards";
import { DragLayer } from "./layers/DragLayer";
import { AnimationLayer } from "./layers/AnimationLayer";
import type { Controller } from "@/core/GameController";
import type { EventEmitter } from "@/core/lib/EventEmitter";
import { ESolitaireRules } from "@/core/rules/GameRulesFactory";
import type { UIController } from "./UIController";

export class GameScene extends PIXI.Container {
    private fieldBucket!: FieldBucket;
    private tempBucket!: TempBucket;
    private resultBucket!: ResultBucket;
    private drawnCards!: DrawnCards;
    private dragLayer!: DragLayer;
    private animationLayer!: AnimationLayer;

    constructor(
        private readonly game: Game,
        private readonly controller: Controller,
        private readonly uiController: UIController,
        private readonly eventEmitter: EventEmitter,
        private readonly pixiEmitter: PIXI.EventEmitter
    ) {
        super();
        this.render();
    }
    
    render() {
        if (this.game.rulesType === ESolitaireRules.CLASSIC) {
            // Создаем временное хранилище (вверху)
            this.tempBucket = new TempBucket(
                this.game.getTemp(),
                this.controller,
                this.pixiEmitter
            );
            this.tempBucket.x = 50;
            this.tempBucket.y = 50;
            this.addChild(this.tempBucket);
        }

        // Создаем результирующие слоты (вверху справа)
        this.resultBucket = new ResultBucket(
            this.game.getResult(),
            this.controller,
            this.pixiEmitter
        );
        this.resultBucket.x = 400;
        this.resultBucket.y = 50;
        this.addChild(this.resultBucket);

        if (this.game.rulesType === ESolitaireRules.KLONDIKE) {
            // Создаем область вытянутых карт (вверху слева)
            const drawnCardsArea = this.game.getDrawnCardsArea();
            if (drawnCardsArea) {
                this.drawnCards = new DrawnCards(
                    drawnCardsArea,
                    this.game.getDeck(),
                    this.controller,
                    this.pixiEmitter,
                );
                this.drawnCards.x = 50;
                this.drawnCards.y = 50;
                this.addChild(this.drawnCards);
            }
        }

        // Создаем игровое поле с колонками (внизу)
        this.fieldBucket = new FieldBucket(
            this.game.getField(),
            this.controller,
            this.eventEmitter,
            this.pixiEmitter
        );
        this.fieldBucket.x = 50;
        this.fieldBucket.y = 180;
        this.addChild(this.fieldBucket);

        // Создаем слой для анимаций ПОСЛЕ всех игровых элементов
        this.animationLayer = new AnimationLayer(
            this.pixiEmitter,
            this.uiController,
            this.controller,
            this.width,
            this.height
        );
        this.addChild(this.animationLayer);

        // Создаем слой для перетаскивания ПОСЛЕ всех остальных элементов (должен быть поверх всех элементов)
        this.dragLayer = new DragLayer(
            this.pixiEmitter,
            this.uiController,
            this.controller,
            this.width,
            this.height
        );
        this.addChild(this.dragLayer);
    }

    // Метод для обновления всей сцены
    update() {
        this.tempBucket.update();
        this.resultBucket.update();
        if (this.drawnCards) {
            this.drawnCards.update();
        }
        this.fieldBucket.update();
    }
}
