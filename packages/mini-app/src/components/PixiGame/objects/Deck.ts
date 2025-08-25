import type { IDeck } from "@/core/interfaces";
import type { Controller } from "@/core/GameController";
import type { EventEmitter } from "@/core/lib/EventEmitter";
import { GameEventType } from "@/core/react/hooks";
import * as PIXI from "pixi.js";

export class Deck extends PIXI.Container {
    private background!: PIXI.Graphics;
    private titleText!: PIXI.Text;
    private countText!: PIXI.Text;
    private cardWidth = 60;
    private cardHeight = 90;
    
    // Делаем колоду интерактивной
    eventMode: PIXI.EventMode = 'static';
    cursor: PIXI.Cursor = 'pointer';

    constructor(
        readonly data: IDeck,
        private readonly controller: Controller,
        private readonly eventEmitter: EventEmitter
    ) {
        super();
        this.on('pointerdown', this.onPointerDown);
        this.render();
    }

    private onPointerDown() {
        console.log('Deck[pointerdown]', this.data);
        this.eventEmitter.emit(GameEventType.DECK_CLICK, {});
    }

    render() {
        // Создаем фон колоды
        this.background = new PIXI.Graphics()
            .roundRect(0, 0, this.cardWidth, this.cardHeight, 6)
            .fill({ color: 0xE3F2FD, alpha: 1 }) // Светло-синий фон
            .stroke({ width: 2, color: 0x90A4AE }); // Серо-синяя рамка
        this.addChild(this.background);

        // Создаем текст "Колода"
        this.titleText = new PIXI.Text({
            text: 'Колода',
            style: {
                fontFamily: 'Arial',
                fontSize: 10,
                fill: 0x546E7A,
                align: 'center',
            }
        });
        this.titleText.anchor.set(0.5, 0);
        this.titleText.x = this.cardWidth / 2;
        this.titleText.y = 5;
        this.addChild(this.titleText);

        // Создаем текст с количеством карт
        const cardCount = this.data.getCards().length;
        this.countText = new PIXI.Text({
            text: cardCount.toString(),
            style: {
                fontFamily: 'Arial',
                fontSize: 18,
                fontWeight: 'bold',
                fill: 0x37474F,
                align: 'center',
            }
        });
        this.countText.anchor.set(0.5, 0.5);
        this.countText.x = this.cardWidth / 2;
        this.countText.y = this.cardHeight / 2;
        this.addChild(this.countText);
    }

    // Метод для обновления отображения
    update() {
        const cardCount = this.data.getCards().length;
        this.countText.text = cardCount.toString();
    }
}
