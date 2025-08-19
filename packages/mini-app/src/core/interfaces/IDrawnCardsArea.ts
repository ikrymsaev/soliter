import type { ICard } from "./ICard";
import type { IObservable } from "../lib/Observable";

export interface IDrawnCardsArea {
    readonly id: string;
    readonly type: 'drawn-cards';
    
    getCards(): ICard[];
    getCardsObservable(): IObservable<ICard[]>;
    addCard(card: ICard): void;
    removeCard(card: ICard): boolean;
    getTopCard(): ICard | null;
    isEmpty(): boolean;
    getCardCount(): number;
    clear(): void;
    returnAllCardsToDeck(deck: any): void;
}
