import type { Game } from "./Game";
import type { EventEmitter } from "./lib/EventEmitter";
import { EGameEvent, type MoveCardEvent, type MoveStackEvent } from "./lib/events";
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
    public selectedStack = observable<ICard[] | null>(null);

    constructor(
        private readonly eventEmitter: EventEmitter,
        private readonly game: Game,
    ) {
        this.eventEmitter.on(EGameEvent.MoveCardToSlot, this.moveCardToSlot);
        this.eventEmitter.on(EGameEvent.MoveStackToSlot, this.moveStackToSlot);
        this.eventEmitter.on(EGameEvent.SelectCard, this.selectCard);
        this.eventEmitter.on(EGameEvent.GetCardFromDeck, this.getCardFromDeck);
    }

    private getCardFromDeck = () => {
        this.drawCardFromDeck();
    }

    private selectCard = (data: { card: ICard, slot: ISlot }) => {
        this.setSelectedCard(data.card, data.slot);
    }

    private moveStackToSlot = ({ cards, target, source }: MoveStackEvent) => {
        this.clearSelection();
        if (!(source instanceof Column) || cards.length === 0) return;
        
        // Проверяем возможность перемещения стопки
        if (target instanceof Column) {
            if (!target.canAcceptStack(cards)) return;
            
            // Находим индекс первой карты стопки в исходной колонке
            const sourceCards = source.getCards();
            const firstCardIndex = sourceCards.findIndex(c => c === cards[0]);
            
            if (firstCardIndex === -1) return;
            
            // Перемещаем стопку
            const movedStack = source.removeStack(firstCardIndex);
            target.addStack(movedStack);
            
            // Открываем новую верхнюю карту если необходимо
            this.openTopCardIfNeeded(source);
            this.checkGameCompletion();
        }
    }

    private moveCardToSlot = ({ card, target, source }: MoveCardEvent) => {
        console.log("moveCardToSlot", card, target, source);
        this.clearSelection();
        if (!target.canAcceptCard(card)) return;
        console.log("add card to slot", target);
        target.addCard(card);
        console.log("remove card from source", source);
        source.removeCard(card);
        // Открываем новую верхнюю карту если необходимо
        if (source instanceof Column) {
            this.openTopCardIfNeeded(source);
        }
        this.checkGameCompletion();
    }

    public setSelectedCard = (card: ICard | null, slot?: ISlot) => {
        if (card === this.selectedCard.get()) {
            this.clearSelection();
            return;
        }
        this.selectedCard.set(card);
        this.selectedSlot.set(slot || null);
    };

    public setSelectedStack = (cards: ICard[] | null, slot?: ISlot) => {
        if (cards === this.selectedStack.get()) {
            this.clearSelection();
            return;
        }
        this.selectedStack.set(cards);
        this.selectedSlot.set(slot || null);
    };

    public clearSelection = () => {
        this.selectedCard.set(null);
        this.selectedSlot.set(null);
    };

    private openTopCardIfNeeded = (column: Column) => {
        const remainingCards = column.getCards();
        if (remainingCards.length > 0) {
            const newTopCard = remainingCards[remainingCards.length - 1];
            if (!newTopCard.isVisible()) {
                newTopCard.setVisible(true);
            }
        }
    };

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
        const drawnCardsArea = this.game.getDrawnCardsArea();

        if (deck.isEmpty()) {
            this.restartDeck();
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