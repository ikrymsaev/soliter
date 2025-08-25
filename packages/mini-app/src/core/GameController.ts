import type { Game } from "./Game";
import type { EventEmitter } from "./lib/EventEmitter";
import { EGameEvent, type MoveCardEvent } from "./lib/events";
import { observable, type IObservable } from "./lib/Observable";
import { TempSlot } from "./objects/TempSlot";
import { Column } from "./objects/Column";
import type { IColumn, IResultSlot, ITempBucket, ITempSlot, IDeck, ICard, ISlot } from "./interfaces";
import type { IDrawnCardsArea } from "./interfaces/IDrawnCardsArea";
import { updateGameState } from "./react/hooks/useGameState";

export class Controller {
    public clicks: IObservable<number> = observable(0);
    public selectedCard = observable<ICard | null>(null);
    public selectedSlot = observable<ISlot | null>(null);

    constructor(
        private readonly eventEmitter: EventEmitter,
        private readonly game: Game,
    ) {
        // this.eventEmitter.on(EGameEvent.CARD_CLICK, this.clickCard);
        // this.eventEmitter.on(EGameEvent.CLICK_OUTSIDE, this.clickOutside);
        // this.eventEmitter.on(EGameEvent.COLUMN_CLICK, this.clickColumn);
        // this.eventEmitter.on(EGameEvent.RESULT_SLOT_CLICK, this.clickResultSlot);
        // this.eventEmitter.on(EGameEvent.TEMP_BUCKET_CLICK, this.clickTempBucket);
        // this.eventEmitter.on(EGameEvent.DECK_CLICK, this.clickDeck);
        // this.eventEmitter.on(EGameEvent.DRAG_END, this.dragEnd);
        // this.eventEmitter.on(EGameEvent.DROP, this.handleDrop);
        // New Game Actions
        this.eventEmitter.on(EGameEvent.MoveCardToSlot, this.moveCardToSlot);
        this.eventEmitter.on(EGameEvent.SelectCard, this.selectCard);
    }

    private selectCard = (data: { card: ICard, slot: ISlot }) => {
        this.setSelectedCard(data.card, data.slot);
    }

    private moveCardToSlot = ({ card, target, source }: MoveCardEvent) => {
        this.setSelectedCard(null);
        if (!target.canAcceptCard(card)) return;
        target.addCard(card);
        source.removeCard(card);
    }

    public setSelectedCard = (card: ICard | null, slot?: ISlot) => {
        if (card === this.selectedCard.get()) {
            this.selectedCard.set(null);
            this.selectedSlot.set(null);
            return;
        }
        this.selectedCard.set(card);
        this.selectedSlot.set(slot || null);
    };

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

    private dragEnd = (data: { card: ICard, sourceSlot?: any, targetSlot?: any }) => {
        console.log('Controller[drag:end]', data);
        
        // При завершении перетаскивания снимаем выделение с карты
        this.setSelectedCard(null);
        
        // Если перетаскивание было отменено (нет целевого слота), карта уже восстановлена в DragLayer
        if (!data.targetSlot) {
            console.log('Controller: Drag cancelled, card restored to original position');
        }
    }

    private handleDrop = (data: { card: ICard, sourceSlot: any, targetSlot: any }) => {
        console.log('Controller[drop]', data);
        
        // Пытаемся переместить карту в целевой слот
        const success = this.moveCard(data.card, data.targetSlot);
        
        if (success) {
            // Если перемещение успешно, снимаем выделение с карты
            this.setSelectedCard(null);
        } else {
            // Если перемещение не удалось, уведомляем DragLayer о необходимости восстановить карту
            console.log('Controller: Move failed, notifying DragLayer to restore card');
            this.eventEmitter.emit(EGameEvent.DRAG_END, {
                card: data.card,
                sourceSlot: data.sourceSlot,
                targetSlot: null
            });
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
                sourceSlot.removeCard(card);
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
        
        if (!sourceSlot) {
            return false;
        }

        const canMove = rules.canMoveCard(targetSlot, card);
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
                sourceSlot.removeCard(card);
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

        if ('addCard' in targetSlot) {
            (targetSlot as any).addCard(card);
        } else if ('addCardToSlot' in targetSlot) {
            const emptySlot = targetSlot.slots.find(slot => slot.isEmpty());
            if (emptySlot) {
                (targetSlot as any).addCardToSlot(card, emptySlot);
            } else {
                return false;
            }
        } else {
            return false;
        }

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

        // Проверяем состояние игры после перемещения карты из колоды
        this.checkGameCompletion();
        
        return true;
    }

    public shuffleDeck = (): void => {
        const deck = this.game.getDeck();
        deck.shuffle();
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