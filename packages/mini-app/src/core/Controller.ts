import type { Game } from "./Game";
import type { EventEmitter } from "./lib/EventEmitter";
import type { Card } from "./objects/Card";
import { EGameEvent, EGameAction } from "./lib/events";
import { TempBucket } from "./objects/TempBucket";
import { observable, type IObservable } from "./lib/Observable";
import { TempSlot } from "./objects/TempSlot";
import { Column } from "./objects/Column";
import type { IColumn, IResultSlot, ITempBucket, ITempSlot, IDeck, ICard } from "./interfaces";

export class Controller {
    public clicks: IObservable<number> = observable(0);
    public selectedCard = observable<ICard | null>(null);

    constructor(
        private readonly eventEmitter: EventEmitter,
        private readonly game: Game,
    ) {
        console.log('[Controller] constructor', this.game);

        this.eventEmitter.on(EGameEvent.CARD_CLICK, this.clickCard);
        this.eventEmitter.on(EGameEvent.CLICK_OUTSIDE, this.clickOutside);
        this.eventEmitter.on(EGameEvent.COLUMN_CLICK, this.clickColumn);
        this.eventEmitter.on(EGameEvent.RESULT_SLOT_CLICK, this.clickResultSlot);
        this.eventEmitter.on(EGameEvent.TEMP_BUCKET_CLICK, this.clickTempBucket);
        this.eventEmitter.on(EGameEvent.DECK_CLICK, this.clickDeck);
    }

    private clickCard = (data: { card: ICard }) => {
        this.clicks.set((prev) => prev + 1);
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
            // Если выбрана карта, возвращаем её в колоду
            if (this.returnCardToDeck(selectedCard)) {
                this.setSelectedCard(null);
            }
        } else {
            // Если карта не выбрана, вытягиваем карту из колоды
            this.drawCardFromDeck();
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
        
        return true;
    }

    public findCardSlot = (card: ICard): IColumn | IResultSlot | ITempBucket | ITempSlot | null => {
        const { columns, temp, result } = this.game.getAllSlots();

        // Проверяем колонки
        for (const column of columns) {
            if (column.getCards().includes(card)) {
                return column;
            }
        }

        // Проверяем временные слоты
        for (const slot of temp.slots) {
            if (slot.card.get() === card) {
                return slot;
            }
        }

        // Проверяем результатные слоты
        const slot = result.find(slot => slot.getCards().get().includes(card));
        if (slot) {
            return slot;
        }

        // Карты из колоды не могут быть перенесены (они должны быть сначала вытянуты)
        // Поэтому не возвращаем deck как слот

        return null;
    }

    // Метод для прямого переноса карты (для использования из UI)
    public moveCard = (card: Card, targetSlot: IColumn | IResultSlot | ITempBucket | ITempSlot | IDeck): boolean => {
        return this.tryMoveCard(card, targetSlot);
    }

    // Внутренний метод для попытки перемещения карты
    private tryMoveCard = (card: ICard, targetSlot: IColumn | IResultSlot | ITempBucket | ITempSlot | IDeck): boolean => {
        const rules = this.game.getRules();
        const sourceSlot = this.findCardSlot(card);
        
        if (!sourceSlot) {
            return false;
        }

        // Проверяем правила игры
        if (!rules.canMoveCard(targetSlot, card)) {
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

        // Добавляем карту в целевой слот
        if ('addCard' in targetSlot) {
            targetSlot.addCard(card);
        } else if (targetSlot instanceof TempBucket) {
            // Для TempBucket используем специальный метод
            const emptySlot = targetSlot.slots.find(slot => slot.isEmpty());
            if (emptySlot) {
                targetSlot.addCardToSlot(card, emptySlot);
            } else {
                return false;
            }
        } else {
            return false;
        }

        // Уведомляем об изменении состояния
        this.eventEmitter.emit(EGameEvent.GAME_STATE_CHANGED, { 
            action: EGameAction.MOVE,
            card, 
            sourceSlot, 
            targetSlot 
        });

        return true;
    }

    // Метод для перемещения стопки карт
    public moveStack = (sourceColumn: IColumn, fromIndex: number, targetSlot: IColumn | IResultSlot | ITempBucket | ITempSlot | IDeck): boolean => {
        // Проверяем, что можем переместить стопку из исходной колонки
        if (!sourceColumn.canMoveStack(fromIndex)) {
            return false;
        }

        const stack = sourceColumn.getMovableStack(fromIndex);
        
        // Для колонок проверяем, можем ли принять стопку
        if (targetSlot instanceof Column) {
            if (!targetSlot.canAcceptStack(stack)) {
                return false;
            }
        } else {
            // Для других слотов перемещаем только первую карту
            if (stack.length > 1) {
                return false;
            }
            return this.moveCard(stack[0], targetSlot);
        }

        // Удаляем стопку из исходной колонки
        const removedStack = sourceColumn.removeStack(fromIndex);
        
        // Добавляем стопку в целевую колонку
        targetSlot.addStack(removedStack);

        // Уведомляем об изменении состояния
        this.eventEmitter.emit(EGameEvent.GAME_STATE_CHANGED, { 
            action: EGameAction.MOVE_STACK,
            cards: removedStack, 
            sourceSlot: sourceColumn, 
            targetSlot 
        });

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
        
        // Проверяем правила игры
        if (!rules.canDrawFromDeck(deck)) {
            return null;
        }
        
        const card = deck.drawCard();
        
        if (card) {
            // Уведомляем об изменении состояния
            this.eventEmitter.emit(EGameEvent.GAME_STATE_CHANGED, { 
                action: EGameAction.DRAW_CARD, 
                card, 
                deck 
            });
        }
        
        return card;
    }

    // Метод для переноса карты из колоды в слот
    public moveCardFromDeckToSlot = (targetSlot: IColumn | IResultSlot | ITempBucket | ITempSlot | IDeck): boolean => {
        const deck = this.game.getDeck();
        const rules = this.game.getRules();
        
        // Проверяем правила игры
        if (!rules.canDrawFromDeck(deck)) {
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
            targetSlot.addCard(card);
        } else if (targetSlot instanceof TempBucket) {
            // Для TempBucket используем специальный метод
            const emptySlot = targetSlot.slots.find(slot => slot.isEmpty());
            if (emptySlot) {
                targetSlot.addCardToSlot(card, emptySlot);
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
            deck, 
            targetSlot 
        });
        
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

    /**
     * Получает доступные ходы для карты
     */
    public getAvailableMoves = (card: ICard): Array<IColumn | IResultSlot | ITempBucket | ITempSlot | IDeck> => {
        return this.game.getAvailableMoves(card);
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
}