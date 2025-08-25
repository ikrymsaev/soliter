import type { Game } from "@/core/Game";
import type { EventEmitter } from "@/core/lib/EventEmitter";
import * as PIXI from "pixi.js"
import { EPixiEvent, type TDragDropEvent, type TDragStartEvent, type TDragCancelEvent, type TElementClickEvent, type TAnimateMoveEvent } from "./events";
import { Card, ResultSlot, TempSlot, EmptySlot, DrawnCards } from "./objects";
import type { DragController } from "./controllers/DragController";
import type { AnimationController } from "./controllers/AnimationController";
import { findTargetSlot, isCard, isColumn, isResultSlot, isTempSlot, isEmptySlot, isDrawnSlot, isDeck, findCardElement, findSlotElement } from "./utils";
import { EGameEvent } from "@/core/lib/events";
import type { Controller } from "@/core/GameController";

export class UIController {
    dragController!: DragController
    animationController!: AnimationController

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

    setupAnimationController(controller: AnimationController) {
        this.animationController = controller;
        this.pixiEmitter.on(EPixiEvent.AnimateMove, this.onAnimateMove)
    }

    private onClickElement = ({ element }: TElementClickEvent) => {
        if (!element || !element.parent) return;
        
        if (isCard(element)) return this.onCardClick(element);
        if (isTempSlot(element)) return this.onTempSlotClick(element);
        if (isResultSlot(element)) return this.onResultSlotClick(element);
        if (isEmptySlot(element)) return this.onEmptySlotClick(element);
        if (isDrawnSlot(element)) return this.onDrawnSlotClick(element);
        if (isDeck(element)) return this.onDeckClick(element);
    }

    private onDrawnSlotClick = ({ data }: DrawnCards) => {
        console.log("onDrawnSlotClick", data);
        if (!data) return;
        this.gameEmitter.emit(EGameEvent.GetCardFromDeck);
    }

    private onDeckClick = ({ data }: any) => {
        console.log("onDeckClick", data);
        if (!data) return;
    }

    private onResultSlotClick = ({ data }: ResultSlot) => {
        if (!data) return;

        const selectedCard = this.gameController.selectedCard.get();
        const selectedStack = this.gameController.selectedStack.get();
        
        if (selectedStack && selectedStack.length > 1) {
            // Для result slot можно перемещать только одну карту
            return;
        }
        
        if (selectedCard) {
            this.animateCardMoveToSlot(selectedCard, this.gameController.selectedSlot.get(), data);
        }
    }

    private onTempSlotClick = ({ data }: TempSlot) => {
        if (!data) return;

        const selectedCard = this.gameController.selectedCard.get();
        const selectedStack = this.gameController.selectedStack.get();
        
        if (selectedStack && selectedStack.length > 1) {
            // Для temp slot можно перемещать только одну карту
            return;
        }
        
        if (selectedCard) {
            this.animateCardMoveToSlot(selectedCard, this.gameController.selectedSlot.get(), data);
        }
    }

    private onEmptySlotClick = ({ data }: EmptySlot) => {
        if (!data) return;

        const selectedCard = this.gameController.selectedCard.get();
        if (selectedCard) {
            this.animateCardMoveToSlot(selectedCard, this.gameController.selectedSlot.get(), data);
        }
    }

    private onCardClick = ({ data, parent }: Card) => {
        console.log("onCardClick", data, parent);

        if (!parent) return;
        if (!(isColumn(parent) || isTempSlot(parent) || isResultSlot(parent) || isDrawnSlot(parent))) return;
        
        const rules = this.game.getRules();
        const selectedCard = this.gameController.selectedCard.get();

        // Если выбрана одна карта, перемещаем её
        if (selectedCard) {
            return this.animateCardMoveToSlot(selectedCard, this.gameController.selectedSlot.get(), parent.data);
        }

        const canInteract = rules.canInteractWithCard(data, parent.data);
        if (!canInteract) return;
        
        return this.gameEmitter.emit(EGameEvent.SelectCard, {
            card: data,
            slot: parent.data
        });
    }

    private onCardDragStart = ({ element, event }: TDragStartEvent) => {
        if (!element ||!element.parent) return;
        
        if (isCard(element)) {
            const { data, parent } = element;
            if (!(isColumn(parent) || isTempSlot(parent) || isResultSlot(parent))) return;
            
            const rules = this.game.getRules();
            const selectedStack = this.gameController.selectedStack.get();
            
            // Если выбрана стопка и эта карта входит в неё, перетаскиваем стопку
            if (selectedStack && selectedStack.includes(data)) {
                // Проверяем возможность взаимодействия со стопкой
                const canInteractWithStack = rules.canInteractWithStack(parent.data, data);
                if (canInteractWithStack) {
                    this.dragController.startDrag({ element, event });
                    return;
                }
            }
            
            // Если стопка не выбрана, но карта может быть частью стопки (для колонок)
            if (!selectedStack && isColumn(parent)) {
                const canInteractWithStack = rules.canInteractWithStack(parent.data, data);
                if (canInteractWithStack) {
                    // Автоматически выбираем стопку и начинаем перетаскивание
                    const cards = parent.data.getCards();
                    const cardIndex = cards.findIndex(c => c === data);
                    const stackCards = cards.slice(cardIndex);
                    
                    if (stackCards.length > 1) {
                        this.gameController.setSelectedCard(stackCards[0], parent.data);
                        this.gameController.setSelectedStack(stackCards, parent.data);
                        this.dragController.startDrag({ element, event });
                        return;
                    }
                }
            }
            
            // Обычное перетаскивание одной карты
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

        const selectedStack = this.gameController.selectedStack.get();
        
        // Если выбрана стопка и перетаскиваемая карта входит в неё
        if (selectedStack && selectedStack.includes(element.data)) {
            return this.dropStackFlow(selectedStack, target, source);
        }

        // Обычное перетаскивание одной карты
        const isRulesAcceptMove = (): boolean => {
            const rules = this.game.getRules();
            if (isColumn(target)) return rules.canColumnAcceptCard(target.data, element.data)
            if (isTempSlot(target)) return rules.canTempSlotAcceptCard(target.data)
            if (isResultSlot(target)) return rules.canResultSlotAcceptCard(target.data, element.data)
            return false;
        }

        if (isRulesAcceptMove()) {
            this.completeSuccessfulDrag();
            this.animateCardMoveToSlot(element.data, source.data, target.data);
        } else {
            this.restoreCardToOriginalPosition();
        }
    }

    private dropStackFlow(selectedStack: any[], target: any, source: PIXI.Container) {
        // Стопки можно перемещать только в колонки
        if (!isColumn(target)) {
            return this.restoreStackToOriginalPosition();
        }

        const rules = this.game.getRules();
        const firstCard = selectedStack[0];
        
        // Проверяем, может ли колонка принять стопку (проверяем первую карту)
        if (rules.canColumnAcceptCard(target.data, firstCard)) {
            this.completeSuccessfulDrag();
            this.animateStackMoveToSlot(selectedStack, (source as any).data, target.data);
        } else {
            this.restoreStackToOriginalPosition();
        }
    }

    private restoreStackToOriginalPosition() {
        this.dragController.restoreElement();
    }

    private restoreCardToOriginalPosition() {
        this.dragController.restoreElement();
    }

    private completeSuccessfulDrag() {
        this.dragController.completeDrag();
    }

    private onAnimateMove = ({ card, fromPosition, toPosition, onComplete }: TAnimateMoveEvent) => {
        this.animationController.animateCardMove({
            card,
            fromPosition,
            toPosition,
            onComplete,
            config: {
                duration: 400,
                easing: 'easeOut'
            }
        });
    }

    // Метод для получения глобальной позиции элемента
    private getGlobalPosition(element: PIXI.Container): PIXI.Point {
        return element.toGlobal(new PIXI.Point(0, 0));
    }

    // Метод для запуска анимированного перемещения карты
    public animateCardMove(card: any, fromElement: PIXI.Container, toElement: PIXI.Container, onComplete?: () => void) {
        const fromPosition = this.getGlobalPosition(fromElement);
        const toPosition = this.getGlobalPosition(toElement);
        
        this.pixiEmitter.emit(EPixiEvent.AnimateMove, {
            card,
            fromPosition,
            toPosition,
            onComplete
        });
    }

    // Метод для анимированного перемещения карты между слотами
    private animateCardMoveToSlot(card: any, sourceSlot: any, targetSlot: any) {
        // Находим визуальные элементы карты и слотов
        const gameScene = this.appStage.children[0] as PIXI.Container;
        const cardElement = findCardElement(gameScene, card);
        const targetElement = findSlotElement(gameScene, targetSlot);
        
        if (!cardElement || !targetElement) {
            // Если не можем найти элементы, выполняем мгновенное перемещение
            this.gameEmitter.emit(EGameEvent.MoveCardToSlot, {
                card,
                source: sourceSlot,
                target: targetSlot,
            });
            return;
        }

        // Получаем позиции для анимации
        const fromPosition = this.getGlobalPosition(cardElement);
        const toPosition = this.calculateFinalCardPosition(targetElement, targetSlot);
        
        // Скрываем оригинальную карту
        cardElement.visible = false;
        
        // Запускаем анимацию
        this.pixiEmitter.emit(EPixiEvent.AnimateMove, {
            card,
            fromPosition,
            toPosition,
            onComplete: () => {
                // После анимации выполняем логическое перемещение
                this.gameEmitter.emit(EGameEvent.MoveCardToSlot, {
                    card,
                    source: sourceSlot,
                    target: targetSlot,
                });
                // Восстанавливаем видимость карты (она будет в новой позиции)
                cardElement.visible = true;
            }
        });
    }

    // Метод для вычисления финальной позиции карты в целевом слоте
    private calculateFinalCardPosition(targetElement: PIXI.Container, targetSlot: any): PIXI.Point {
        const basePosition = this.getGlobalPosition(targetElement);
        
        // Для колонок вычисляем позицию с учетом уже существующих карт
        if (isColumn(targetElement)) {
            const currentCards = targetSlot.getCards();
            const cardOverlap = 25; // Из Column.ts
            
            // Позиция новой карты будет на currentCards.length * cardOverlap ниже базовой позиции
            return new PIXI.Point(
                basePosition.x,
                basePosition.y + (currentCards.length * cardOverlap)
            );
        }
        
        // Для других типов слотов (ResultSlot, TempSlot, EmptySlot) карта размещается в базовой позиции
        return basePosition;
    }

    // Метод для анимированного перемещения стопки карт
    private animateStackMoveToSlot(cards: any[], sourceSlot: any, targetSlot: any) {
        // Для стопки пока делаем мгновенное перемещение
        // TODO: Реализовать анимацию стопки карт
        this.gameEmitter.emit(EGameEvent.MoveStackToSlot, {
            cards,
            source: sourceSlot,
            target: targetSlot,
        });
    }
}