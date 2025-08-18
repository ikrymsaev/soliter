import { CARD_SUITS, CARD_TYPES, Card } from "./Card";
import type { IDeck, ICard } from "../interfaces";

export class Deck implements IDeck {
    private cards: ICard[] = [];
    public readonly id: string;
    public readonly type: 'deck' = 'deck';

    constructor() {
        this.id = `deck-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        for (const cardSuit of CARD_SUITS) {
            for (const cardType of CARD_TYPES) {
                this.cards.push(new Card(cardType.type, cardSuit.suit));
            }
        }
    }

    public getCards(): ICard[] {
        return this.cards;
    }

    public addCard(card: ICard): void {
        this.cards.push(card);
    }

    public removeCard(card: ICard): boolean {
        const index = this.cards.indexOf(card);
        if (index > -1) {
            this.cards.splice(index, 1);
            return true;
        }
        return false;
    }

    public canAcceptCard(): boolean {
        // Колода может принять любую карту (простая логика)
        return true;
    }

    public shuffle(): void {
        this.cards = this.cards.sort(() => Math.random() - 0.5);
        console.log(this.cards);
    }

    // Дополнительные методы для работы с колодой
    public drawCard(): ICard | null {
        if (this.cards.length > 0) {
            return this.cards.pop() || null;
        }
        return null;
    }

    public isEmpty(): boolean {
        return this.cards.length === 0;
    }

    public getCardCount(): number {
        return this.cards.length;
    }
}