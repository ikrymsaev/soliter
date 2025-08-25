import type { ICard } from "../interfaces/ICard";
import type { IDrawnCardsArea } from "../interfaces/IDrawnCardsArea";
import { observable, type IObservable } from "../lib/Observable";

export class DrawnCardsArea implements IDrawnCardsArea {
    private cards: ICard[] = [];
    public readonly type: 'drawn-cards' = 'drawn-cards';
    public readonly cardsObservable: IObservable<ICard[]>;

    constructor() {
        this.cardsObservable = observable<ICard[]>([]);
    }

    canAcceptCard(_: ICard): boolean {
        return false;
    }

    public getCards(): ICard[] {
        return this.cards;
    }

    public getCardsObservable(): IObservable<ICard[]> {
        return this.cardsObservable;
    }

    public addCard(card: ICard): void {
        this.cards.push(card);
        this.cardsObservable.set([...this.cards]);
    }

    public removeCard(card: ICard): boolean {
        const index = this.cards.indexOf(card);
        if (index > -1) {
            this.cards.splice(index, 1);
            this.cardsObservable.set([...this.cards]);
            return true;
        }
        return false;
    }

    public getTopCard(): ICard | null {
        if (this.cards.length > 0) {
            return this.cards[this.cards.length - 1];
        }
        return null;
    }

    public isEmpty(): boolean {
        return this.cards.length === 0;
    }

    public getCardCount(): number {
        return this.cards.length;
    }

    public clear(): void {
        this.cards = [];
        this.cardsObservable.set([]);
    }

    public returnAllCardsToDeck(deck: any): void {
        // Возвращаем все карты в колоду в обратном порядке (чтобы сохранить порядок)
        for (let i = this.cards.length - 1; i >= 0; i--) {
            deck.addCard(this.cards[i]);
        }
        this.clear();
    }
}
