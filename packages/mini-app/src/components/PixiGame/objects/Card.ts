import type { Controller } from "@/core/GameController";
import type { ICard } from "@/core/interfaces";
import * as PIXI from "pixi.js";
import { EPixiEvent } from "../events";

export class Card extends PIXI.Container {
    private background!: PIXI.Graphics;
    private text!: PIXI.Text;
    private cardWidth = 60;
    private cardHeight = 90;
    private isSelected = false;
    private isSelectedByStack = false;
    private isPointerDown = false;
    // Делаем карту интерактивной
    eventMode: PIXI.EventMode = 'static';
    cursor: PIXI.Cursor = 'pointer';

    constructor(
        readonly data: ICard,
        private readonly controller: Controller,
        private readonly uiEmitter: PIXI.EventEmitter
    ) {
        super();
        this.on('pointerdown', this.onPointerDown);
        this.on('pointerup', this.onPointerUp);
        this.on('pointerupoutside', this.onPointerUpOutside);
        this.subscribeToSelectedCard();
        this.render();
    }

    get borderColor() {
        return this.isSelected || this.isSelectedByStack ? 0x0000FF : 0x000000;
    }

    get textColor() {
        return this.data.getCardSuitInfo().color === "red" ? 0xFF0000 : 0x000000;
    }

    private subscribeToSelectedCard() {
        this.controller.selectedCard.subscribe((card) => {
            if (!card) this.isSelected = false;
            if (card) {
                this.isSelected = card === this.data;
            }
            this.render();
        });
    }

    private onPointerDown(event: PIXI.FederatedPointerEvent) {
        event.stopPropagation();
        this.isPointerDown = true;
        this.startDrag(event);
    }

    private onPointerUp(event: PIXI.FederatedPointerEvent) {
        event.stopPropagation();
        if (this.isPointerDown) {
            this.uiEmitter.emit(EPixiEvent.Click, { element: this });
        }
        this.isPointerDown = false;
    }

    private onPointerUpOutside(event: PIXI.FederatedPointerEvent) {
        event.stopPropagation();
        this.isPointerDown = false;
    }

    private startDrag(event: PIXI.FederatedPointerEvent) {
        if (!this.data.isVisible() || event.button !== 0) return;
        
        this.uiEmitter.emit(EPixiEvent.TryDrag, {
            element: this,
            event,
        });
    }

    render() {
        this.background = new PIXI.Graphics()
            .roundRect(0, 0, this.cardWidth, this.cardHeight, 6)
            .fill({ color: 0xFFFFFF, alpha: 1 })
            .stroke({ width: 2, color: this.borderColor });
        this.addChild(this.background);

        if (this.data.isVisible()) {
            this.renderFace();
            return;
        }
        this.renderBack();
    }

    private renderFace() {
        const cardType = this.data.getCardTypeInfo();
        const cardSuit = this.data.getCardSuitInfo();

        const displayText = `${cardType.name}${cardSuit.suit}`;
        this.text = new PIXI.Text({
            text: displayText,
            style: {
                fontFamily: 'Arial',
                fontSize: 12,
                fill: this.textColor,
                align: 'left',
            }
        });
        this.text.anchor.set(0, 0);
        this.text.x = 5;
        this.text.y = 5;
        
        this.addChild(this.text);
    }

    private renderBack() {
        this.background.clear()
            .roundRect(0, 0, this.cardWidth, this.cardHeight, 6)
            .fill({ color: 0x2196F3, alpha: 1 })
            .stroke({ width: 2, color: this.borderColor });
        
        const pattern = new PIXI.Graphics()
            .rect(5, 5, this.cardWidth - 10, this.cardHeight - 10)
            .stroke({ width: 1, color: 0x1976D2 });
        this.addChild(pattern);
    }
}