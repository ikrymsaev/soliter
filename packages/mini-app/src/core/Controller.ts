import type { Game } from "./Game";
import type { EventEmitter } from "./lib/EventEmitter";
import { EGameEvent, EGameAction } from "./lib/events";
import { observable, type IObservable } from "./lib/Observable";
import { TempSlot } from "./objects/TempSlot";
import { Column } from "./objects/Column";
import type { IColumn, IResultSlot, ITempBucket, ITempSlot, IDeck, ICard } from "./interfaces";
import type { IDrawnCardsArea } from "./interfaces/IDrawnCardsArea";
import { updateGameState } from "./react/hooks/useGameState";

export class Controller {
    public clicks: IObservable<number> = observable(0);
    public selectedCard = observable<ICard | null>(null);

    constructor(
        private readonly eventEmitter: EventEmitter,
        private readonly game: Game,
    ) {
        this.eventEmitter.on(EGameEvent.CARD_CLICK, this.clickCard);
        this.eventEmitter.on(EGameEvent.CLICK_OUTSIDE, this.clickOutside);
        this.eventEmitter.on(EGameEvent.COLUMN_CLICK, this.clickColumn);
        this.eventEmitter.on(EGameEvent.RESULT_SLOT_CLICK, this.clickResultSlot);
        this.eventEmitter.on(EGameEvent.TEMP_BUCKET_CLICK, this.clickTempBucket);
        this.eventEmitter.on(EGameEvent.DECK_CLICK, this.clickDeck);
    }

    private clickCard = (data: { card: ICard }) => {
        this.clicks.set((prev) => prev + 1);
        const currentSelectedCard = this.selectedCard.get();
        
        if (currentSelectedCard && currentSelectedCard !== data.card) {
            const targetSlot = this.findCardSlot(data.card);
            if (targetSlot) {
                const success = this.moveCard(currentSelectedCard, targetSlot);
                if (success) {
                    this.setSelectedCard(null);
                    return;
                }
            }
        }
        this.selectedCard.set(data.card);
    }

    private clickOutside = () => {
        this.clicks.set((prev) => prev + 1);
        this.selectedCard.set(null);
    }

    public setSelectedCard = (card: ICard | null) => {
        this.selectedCard.set(card);
    };

    // Обработчики кликов по разным типам слотов
    private clickColumn = (data: { slot: IColumn }) => {
        this.clicks.set((prev) => prev + 1);
        const selectedCard = this.selectedCard.get();
        if (!selectedCard) {
            return;
        }
        this.moveCard(selectedCard, data.slot);
        this.setSelectedCard(null);
    }

    private clickResultSlot = (data: { slot: IResultSlot }) => {
        this.clicks.set((prev) => prev + 1);
        const selectedCard = this.selectedCard.get();
        if (!selectedCard) {
            return;
        }
        this.moveCard(selectedCard, data.slot);
        this.setSelectedCard(null);
    }

    private clickTempBucket = (data: { slot: ITempBucket | ITempSlot }) => {
        this.clicks.set((prev) => prev + 1);
        const selectedCard = this.selectedCard.get();
        
        if (!selectedCard) {
            return;
        }
        this.moveCard(selectedCard, data.slot);
        this.setSelectedCard(null);
    }

    private clickDeck = () => {
        const selectedCard = this.selectedCard.get();
        
        if (selectedCard) {
            // Проверяем правила игры для возврата карты в колоду
            const rules = this.game.getRules();
            if (rules.canReturnCardToDeck()) {
                // Возвращаем карту в колоду
                if (this.returnCardToDeck(selectedCard)) {
                    this.setSelectedCard(null);
                }
            } else {
                // Просто снимаем выделение с карты
                this.setSelectedCard(null);
            }
        } else {
            // Если карта не выбрана, вытягиваем карту из колоды
            const card = this.drawCardFromDeck();
            
            // Если карта не вытянута (колода пуста), но есть вытянутые карты, перезапускаем колоду
            if (!card) {
                this.restartDeck();
            }
        }
    }

    // Метод для возврата карты в колоду
    public returnCardToDeck = (card: ICard): boolean => {
        const deck = this.game.getDeck();
        
        // Находим исходный слот карты
        const sourceSlot = this.findCardSlot(card);
        if (!sourceSlot) {
            return false;
        }

        // Удаляем карту из исходного слота
        let removed = false;
        if ('removeCard' in sourceSlot) {
            if (sourceSlot instanceof TempSlot) {
                sourceSlot.removeCard();
                removed = true;
            } else {
                removed = sourceSlot.removeCard(card) || false;
            }
        }
        if (!removed) {
            return false;
        }

        // Добавляем карту в колоду
        deck.addCard(card);
        
        // Уведомляем об изменении состояния
        this.eventEmitter.emit(EGameEvent.GAME_STATE_CHANGED, { 
            action: EGameAction.RETURN_TO_DECK,
            card, 
            sourceSlot, 
            deck 
        });

        // Проверяем состояние игры после возврата карты
        this.checkGameCompletion();
        
        return true;
    }

    public findCardSlot = (card: ICard): IColumn | IResultSlot | ITempBucket | ITempSlot | IDrawnCardsArea | null => {
        const { columns, temp, result, drawnCardsArea } = this.game.getAllSlots();

        // Проверяем колонки
        for (const column of columns) {
            const columnCards = column.getCards();
            if (columnCards.includes(card)) {
                return column;
            }
        }

        // Проверяем временные слоты
        for (const slot of temp.slots) {
            const slotCard = slot.card.get();
            if (slotCard === card) {
                return slot;
            }
        }

        // Проверяем результатные слоты
        for (const slot of result) {
            const slotCards = slot.getCards().get();
            if (slotCards.includes(card)) {
                return slot;
            }
        }

        // Проверяем область вытянутых карт
        if (drawnCardsArea) {
            const drawnCards = drawnCardsArea.getCards();
            if (drawnCards.includes(card)) {
                return drawnCardsArea;
            }
        }

        return null;
    }

    // Метод для прямого переноса карты (для использования из UI)
    public moveCard = (card: ICard, targetSlot: IColumn | IResultSlot | ITempBucket | ITempSlot | IDeck | IDrawnCardsArea): boolean => {
        return this.tryMoveCard(card, targetSlot);
    }

    // Внутренний метод для попытки перемещения карты
    private tryMoveCard = (card: ICard, targetSlot: IColumn | IResultSlot | ITempBucket | ITempSlot | IDeck | IDrawnCardsArea): boolean => {
        const rules = this.game.getRules();
        const sourceSlot = this.findCardSlot(card);
        
        console.log('tryMoveCard:', {
            card: card.getDisplayName(),
            sourceSlot: sourceSlot ? 'found' : 'null',
            targetSlot: 'target'
        });
        
        if (!sourceSlot) {
            console.log('Source slot not found for card:', card.getDisplayName());
            return false;
        }

        // Проверяем правила игры
        const canMove = rules.canMoveCard(targetSlot, card);        
        console.log('Can move:', canMove);
        
        if (!canMove) {
            return false;
        }

        if (sourceSlot instanceof Column) {
            const cards = sourceSlot.getCards();
            const cardIndex = cards.indexOf(card);
            
            if (cardIndex !== -1) {
                if (sourceSlot.canMoveStack(cardIndex)) {
                    const stack = sourceSlot.getMovableStack(cardIndex);
                    if (stack.length > 1) {
                        return this.moveStack(sourceSlot, cardIndex, targetSlot);
                    }
                }
            }
        }

        // Удаляем карту из исходного слота
        let removed = false;
        if ('removeCard' in sourceSlot) {
            if (sourceSlot instanceof TempSlot) {
                sourceSlot.removeCard();
                removed = true;
            } else {
                removed = sourceSlot.removeCard(card) || false;
            }
        }
        console.log('Card removed from source:', removed);
        
        if (!removed) {
            return false;
        }

        // Если карта была удалена из колонки, открываем новую верхнюю карту
        if (sourceSlot instanceof Column) {
            const remainingCards = sourceSlot.getCards();
            if (remainingCards.length > 0) {
                const newTopCard = remainingCards[remainingCards.length - 1];
                if (!newTopCard.isVisible()) {
                    newTopCard.setVisible(true);
                }
            }
        }

        // Добавляем карту в целевой слот
        let added = false;
        if ('addCard' in targetSlot) {
            (targetSlot as any).addCard(card);
            added = true;
        } else if ('addCardToSlot' in targetSlot) {
            const emptySlot = targetSlot.slots.find(slot => slot.isEmpty());
            if (emptySlot) {
                (targetSlot as any).addCardToSlot(card, emptySlot);
                added = true;
            } else {
                return false;
            }
        } else {
            return false;
        }
        
        console.log('Card added to target:', added);

        // Уведомляем об изменении состояния
        this.eventEmitter.emit(EGameEvent.GAME_STATE_CHANGED, { 
            action: EGameAction.MOVE,
            card, 
            sourceSlot, 
            targetSlot 
        });

        // Проверяем состояние игры после хода
        this.checkGameCompletion();

        return true;
    }

    // Метод для перемещения стопки карт
    public moveStack = (sourceColumn: IColumn, fromIndex: number, targetSlot: IColumn | IResultSlot | ITempBucket | ITempSlot | IDeck | IDrawnCardsArea): boolean => {
        console.log('moveStack called:', { fromIndex, targetSlotType: targetSlot.constructor.name });
        
        // Проверяем, что можем переместить стопку из исходной колонки
        if (!sourceColumn.canMoveStack(fromIndex)) {
            console.log('Cannot move stack from index:', fromIndex);
            return false;
        }

        const stack = sourceColumn.getMovableStack(fromIndex);
        console.log('Stack to move:', stack.length, 'cards');
        
        // Для колонок проверяем, можем ли принять стопку
        if (targetSlot instanceof Column) {
            if (!targetSlot.canAcceptStack(stack)) {
                console.log('Target column cannot accept stack');
                return false;
            }
        } else {
            // Для других слотов перемещаем только первую карту
            if (stack.length > 1) {
                console.log('Cannot move stack to non-column slot');
                return false;
            }
            return this.moveCard(stack[0], targetSlot);
        }

        // Удаляем стопку из исходной колонки
        const removedStack = sourceColumn.removeStack(fromIndex);
        
        // Добавляем стопку в целевую колонку
        targetSlot.addStack(removedStack);

        // Если стопка была удалена из колонки, открываем новую верхнюю карту
        const remainingCards = sourceColumn.getCards();
        if (remainingCards.length > 0) {
            const newTopCard = remainingCards[remainingCards.length - 1];
            if (!newTopCard.isVisible()) {
                console.log('Opening new top card:', newTopCard.getDisplayName());
                newTopCard.setVisible(true);
            }
        }

        // Уведомляем об изменении состояния
        this.eventEmitter.emit(EGameEvent.GAME_STATE_CHANGED, { 
            action: EGameAction.MOVE_STACK,
            cards: removedStack, 
            sourceSlot: sourceColumn, 
            targetSlot 
        });

        // Проверяем состояние игры после хода
        this.checkGameCompletion();

        console.log('Stack moved successfully');
        return true;
    }

    // Метод для получения стопки карт, которую можно переместить
    public getMovableStack = (sourceColumn: IColumn, fromIndex: number): ICard[] => {
        return sourceColumn.getMovableStack(fromIndex);
    }

    // Метод для проверки, можно ли переместить стопку
    public canMoveStack = (sourceColumn: IColumn, fromIndex: number): boolean => {
        return sourceColumn.canMoveStack(fromIndex);
    }

    // Метод для получения всех слотов игры
    public getAllSlots = () => {
        return this.game.getAllSlots();
    }

    // Методы для работы с колодой
    public drawCardFromDeck = (): ICard | null => {
        const deck = this.game.getDeck();
        const rules = this.game.getRules();
        const drawnCardsArea = this.game.getDrawnCardsArea();
        
        // Проверяем правила игры
        if (!rules.canDrawFromDeck(deck as any)) {
            return null;
        }
        
        const card = deck.drawCard();
        
        if (card) {
            // Если есть область для вытянутых карт (Косынка), добавляем туда
            if (drawnCardsArea) {
                drawnCardsArea.addCard(card);
            }
            
            // Уведомляем об изменении состояния
            this.eventEmitter.emit(EGameEvent.GAME_STATE_CHANGED, { 
                action: EGameAction.DRAW_CARD, 
                card, 
                deck: deck as any,
                drawnCardsArea
            });

            // Проверяем состояние игры после вытягивания карты
            this.checkGameCompletion();
        }
        
        return card;
    }

    // Метод для переноса карты из колоды в слот
    public moveCardFromDeckToSlot = (targetSlot: IColumn | IResultSlot | ITempBucket | ITempSlot | IDeck | IDrawnCardsArea): boolean => {
        const deck = this.game.getDeck();
        const rules = this.game.getRules();
        
        // Проверяем правила игры
        if (!rules.canDrawFromDeck(deck as any)) {
            return false;
        }
        
        const card = deck.drawCard();
        
        if (!card) {
            return false;
        }

        // Проверяем правила игры для перемещения
        if (!rules.canMoveCard(targetSlot, card)) {
            // Возвращаем карту в колоду
            deck.addCard(card);
            return false;
        }

        // Добавляем карту в целевой слот
        if ('addCard' in targetSlot) {
            (targetSlot as any).addCard(card);
        } else if ('addCardToSlot' in targetSlot) {
            // Для TempBucket используем специальный метод
            const emptySlot = targetSlot.slots.find(slot => slot.isEmpty());
            if (emptySlot) {
                (targetSlot as any).addCardToSlot(card, emptySlot);
            } else {
                // Возвращаем карту в колоду
                deck.addCard(card);
                return false;
            }
        } else {
            // Возвращаем карту в колоду
            deck.addCard(card);
            return false;
        }
        
        // Уведомляем об изменении состояния
        this.eventEmitter.emit(EGameEvent.GAME_STATE_CHANGED, { 
            action: EGameAction.MOVE_FROM_DECK,
            card, 
            deck: deck as any, 
            targetSlot 
        });

        // Проверяем состояние игры после перемещения карты из колоды
        this.checkGameCompletion();
        
        return true;
    }

    public shuffleDeck = (): void => {
        const deck = this.game.getDeck();
        deck.shuffle();
        
        // Уведомляем об изменении состояния
        this.eventEmitter.emit(EGameEvent.GAME_STATE_CHANGED, { 
            action: EGameAction.SHUFFLE_DECK, 
            deck 
        });
    }

    public restartDeck = (): void => {
        const deck = this.game.getDeck();
        const drawnCardsArea = this.game.getDrawnCardsArea();
        
        // Если есть область вытянутых карт и она не пуста
        if (drawnCardsArea && !drawnCardsArea.isEmpty()) {
            // Возвращаем все вытянутые карты в колоду
            drawnCardsArea.returnAllCardsToDeck(deck);
            
            // Перемешиваем колоду
            deck.shuffle();
            
            // Уведомляем об изменении состояния
            this.eventEmitter.emit(EGameEvent.GAME_STATE_CHANGED, { 
                action: EGameAction.SHUFFLE_DECK, 
                deck,
                drawnCardsArea
            });
        }
    }

    /**
     * Получает доступные ходы для карты
     */
    public getAvailableMoves = (card: ICard): Array<IColumn | IResultSlot | ITempBucket | ITempSlot | IDeck | IDrawnCardsArea> => {
        return this.game.getAvailableMoves(card as any);
    }

    /**
     * Проверяет, завершена ли игра
     */
    public isGameCompleted = (): boolean => {
        return this.game.isGameCompleted();
    }

    /**
     * Получает правила игры
     */
    public getRules = () => {
        return this.game.getRules();
    }

    public getGame = () => {
        return this.game;
    }

    /**
     * Проверяет завершение игры и обновляет состояние
     */
    private checkGameCompletion = () => {
        const isCompleted = this.isGameCompleted();
        const isWon = isCompleted; // В пасьянсе победа = завершение игры
        updateGameState(isCompleted, isWon);
    }
}