import type { Game } from "@/core/Game";
import type { EventEmitter } from "@/core/lib/EventEmitter";
import * as PIXI from "pixi.js"
import { EPixiEvent, type TDragDropEvent, type TDragStartEvent, type TDragCancelEvent, type TElementClickEvent } from "./events";
import { Card, ResultSlot, TempSlot } from "./objects";
import type { DragController } from "./controllers/DragController";
import { findTargetSlot, isCard, isColumn, isResultSlot, isTempSlot } from "./utils";
import { EGameEvent } from "@/core/lib/events";
import type { Controller } from "@/core/GameController";

export class UIController {
    dragController!: DragController

    constructor(
        private readonly game: Game,
        private readonly appStage: PIXI.Container,
        private readonly gameEmitter: EventEmitter,
        private readonly pixiEmitter: PIXI.EventEmitter,
        private readonly gameController: Controller,
    ) {}

    setupDragController(controller: DragController) {
        this.dragController = controller;
        this.pixiEmitter.on(EPixiEvent.TryDrag, this.onCardDragStart)
        this.pixiEmitter.on(EPixiEvent.DragDrop, this.onCardDragDrop)
        this.pixiEmitter.on(EPixiEvent.Cancel, this.onCardDragCancel)
        this.pixiEmitter.on(EPixiEvent.Click, this.onClickElement)
    }

    private onClickElement = ({ element }: TElementClickEvent) => {
        if (!element || !element.parent) return;
        
        if (isCard(element)) return this.onCardClick(element);
        if (isTempSlot(element)) return this.onTempSlotClick(element);
        if (isResultSlot(element)) return this.onResultSlotClick(element);
    }

    private onResultSlotClick = ({ data }: ResultSlot) => {
        if (!data) return;

        const selectedCard = this.gameController.selectedCard.get();
        if (!selectedCard) return;
        
        this.gameEmitter.emit(EGameEvent.MoveCardToSlot, {
            card: selectedCard,
            source: this.gameController.selectedSlot.get(),
            target: data,
        });
    }

    private onTempSlotClick = ({ data }: TempSlot) => {
        if (!data) return;

        const selectedCard = this.gameController.selectedCard.get();
        if (!selectedCard) return;

        this.gameEmitter.emit(EGameEvent.MoveCardToSlot, {
            card: selectedCard,
            source: this.gameController.selectedSlot.get(),
            target: data,
        });
    }

    private onCardClick = ({ data, parent }: Card) => {
        if (!parent) return;
        if (!(isColumn(parent) || isTempSlot(parent) || isResultSlot(parent))) return;
        
        const rules = this.game.getRules();
        const canInteract = rules.canInteractWithCard(data, parent.data)
        if (!canInteract) return;

        const selectedCard = this.gameController.selectedCard.get();
        if (!selectedCard) {
            return this.gameEmitter.emit(EGameEvent.SelectCard, {
                card: data,
                slot: parent.data
            });
        }
        this.gameEmitter.emit(EGameEvent.MoveCardToSlot, {
            card: selectedCard,
            source: this.gameController.selectedSlot.get(),
            target: parent.data,
        });
    }

    private onCardDragStart = ({ element, event }: TDragStartEvent) => {
        if (!element ||!element.parent) return;
        
        if (isCard(element)) {
            const { data, parent } = element;
            if (!(isColumn(parent) || isTempSlot(parent) || isResultSlot(parent))) return;
            
            const rules = this.game.getRules();
            const canInteract = rules.canInteractWithCard(data, parent.data)
            if (!canInteract) return;

            this.dragController.startDrag({ element, event })
        }
    }

    private onCardDragDrop = ({ element, targetPoint, source }: TDragDropEvent) => {
        if (!element || !targetPoint) {
            return this.restoreCardToOriginalPosition()
        }
        if (isCard(element)) {
            return this.dropCardFlow(element, targetPoint, source)
        }
    }

    private onCardDragCancel = (_: TDragCancelEvent) => {
        this.restoreCardToOriginalPosition();
    }

    private dropCardFlow(element: Card, targetPoint: PIXI.Point, source: PIXI.Container) {
        if (!(isColumn(source) || isTempSlot(source) || isResultSlot(source))) return;

        const gameScene = this.appStage.children[0] as PIXI.Container;
        const target = findTargetSlot(gameScene, targetPoint);
        if (!target) return this.restoreCardToOriginalPosition();

        const isRulesAcceptMove = (): boolean => {
            const rules = this.game.getRules();
            if (isColumn(target)) return rules.canColumnAcceptCard(target.data, element.data)
            if (isTempSlot(target)) return rules.canTempSlotAcceptCard(target.data)
            if (isResultSlot(target)) return rules.canResultSlotAcceptCard(target.data, element.data)
            return false;
        }

        if (isRulesAcceptMove()) {
            this.completeSuccessfulDrag();
            this.gameEmitter.emit(EGameEvent.MoveCardToSlot, {
                card: element.data,
                target: target.data,
                source: source.data,
            });
        }

        this.restoreCardToOriginalPosition();
    }

    private restoreCardToOriginalPosition() {
        this.dragController.restoreElement();
    }

    private completeSuccessfulDrag() {
        this.dragController.completeDrag();
    }
}