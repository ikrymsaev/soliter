import { observable } from "../lib/Observable";
import type { ISlotRules } from "../rules/ISlotRules";
import type { IColumn, ICard } from "../interfaces";

export class Column implements IColumn {
    private cards = observable<ICard[]>([]);
    public readonly id: string;
    private readonly rules: ISlotRules<Column>;

    constructor(cards: ICard[], rules: ISlotRules<Column>, id?: string) {
        this.cards.set(cards);
        this.rules = rules;
        this.id = id || `column-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    public getCards(): ICard[] {
        return this.cards.get();
    }

    public getCardsObservable() {
        return this.cards;
    }

    public addCard(card: ICard): void {
        this.cards.set((prev) => [...prev, card]);
    }

    public removeCard(card: ICard): boolean {
        const currentCards = this.cards.get();
        const index = currentCards.indexOf(card);
        if (index > -1) {
            this.cards.set((prev) => prev.filter((c) => c !== card));
            return true;
        }
        return false;
    }

    public canAcceptCard(card: ICard): boolean {
        console.log('[Column] canAcceptCard', card.getDisplayName(), 'for column', this.id);
        return this.rules.canAcceptCard(this, card);
    }

    // Дополнительные методы для работы с колонкой
    public getTopCard(): ICard | null {
        const cards = this.cards.get();
        return cards.length > 0 ? cards[cards.length - 1] : null;
    }

    public isEmpty(): boolean {
        return this.cards.get().length === 0;
    }

    public getCardCount(): number {
        return this.cards.get().length;
    }

    // Методы для работы со стопками карт
    public canMoveStack(fromIndex: number): boolean {
        const cards = this.cards.get();
        if (fromIndex < 0 || fromIndex >= cards.length) {
            console.log(`[Column] canMoveStack: invalid index ${fromIndex}, cards length: ${cards.length}`);
            return false;
        }

        // Получаем стопку от выбранной карты до конца
        const stack = cards.slice(fromIndex);
        console.log(`[Column] canMoveStack: checking from index ${fromIndex}, stack:`, stack.map(c => c.getDisplayName()));

        // Если стопка состоит из одной карты, то её можно перемещать
        if (stack.length === 1) {
            console.log(`[Column] canMoveStack: single card, returning true`);
            return true;
        }

        // Проверяем всю стопку от начала до конца
        for (let i = 0; i < stack.length - 1; i++) {
            const currentCard = stack[i];
            const nextCard = stack[i + 1];
            
            const currentSuit = currentCard.getCardSuitInfo();
            const nextSuit = nextCard.getCardSuitInfo();
            
            console.log(`[Column] checking ${currentCard.getDisplayName()} -> ${nextCard.getDisplayName()}`);
            console.log(`[Column] colors: ${currentSuit.color} vs ${nextSuit.color}`);
            console.log(`[Column] values: ${this.getCardValue(currentCard)} vs ${this.getCardValue(nextCard)}`);
            
            // Карты должны быть разного цвета
            if (currentSuit.color === nextSuit.color) {
                console.log(`[Column] canMoveStack: same color at position ${i}, returning false`);
                console.log(`[Column] Current card: ${currentCard.getDisplayName()} (${currentSuit.color})`);
                console.log(`[Column] Next card: ${nextCard.getDisplayName()} (${nextSuit.color})`);
                return false;
            }
            
            // Карты должны идти по убыванию
            if (this.getCardValue(currentCard) !== this.getCardValue(nextCard) + 1) {
                console.log(`[Column] canMoveStack: wrong order at position ${i}, returning false`);
                return false;
            }
        }

        console.log(`[Column] canMoveStack: entire stack is valid, returning true`);
        return true;
    }

    public getMovableStack(fromIndex: number): ICard[] {
        if (!this.canMoveStack(fromIndex)) {
            return [];
        }
        
        const cards = this.cards.get();
        return cards.slice(fromIndex);
    }

    public removeStack(fromIndex: number): ICard[] {
        if (!this.canMoveStack(fromIndex)) {
            return [];
        }
        
        const cards = this.cards.get();
        const stack = cards.slice(fromIndex);
        this.cards.set((prev) => prev.slice(0, fromIndex));
        return stack;
    }

    public addStack(cards: ICard[]): void {
        this.cards.set((prev) => [...prev, ...cards]);
    }

    public canAcceptStack(cards: ICard[]): boolean {
        if (cards.length === 0) {
            return false;
        }

        // Проверяем, что стопка правильно упорядочена
        for (let i = 0; i < cards.length - 1; i++) {
            const currentCard = cards[i];
            const nextCard = cards[i + 1];
            
            const currentSuit = currentCard.getCardSuitInfo();
            const nextSuit = nextCard.getCardSuitInfo();
            
            // Карты должны быть разного цвета
            if (currentSuit.color === nextSuit.color) {
                return false;
            }
            
            // Карты должны идти по убыванию
            if (this.getCardValue(currentCard) !== this.getCardValue(nextCard) + 1) {
                return false;
            }
        }

        // Проверяем, что первую карту стопки можно положить на верхнюю карту колонки
        const firstCard = cards[0];
        return this.canAcceptCard(firstCard);
    }

    private getCardValue(card: ICard): number {
        const cardType = card.cardType;
        switch (cardType) {
            case 'A': return 1;
            case '2': return 2;
            case '3': return 3;
            case '4': return 4;
            case '5': return 5;
            case '6': return 6;
            case '7': return 7;
            case '8': return 8;
            case '9': return 9;
            case '10': return 10;
            case 'J': return 11;
            case 'Q': return 12;
            case 'K': return 13;
            default: return 0;
        }
    }
}