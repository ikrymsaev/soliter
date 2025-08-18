import type { Card } from "../objects/Card";
import type { IObservable } from "../lib/Observable";

export interface IColumn {
    readonly id: string;
    
    getCards(): Card[];
    getCardsObservable(): IObservable<Card[]>;
    addCard(card: Card): void;
    removeCard(card: Card): boolean;
    canAcceptCard(card: Card): boolean;
    getTopCard(): Card | null;
    isEmpty(): boolean;
    getCardCount(): number;
}
