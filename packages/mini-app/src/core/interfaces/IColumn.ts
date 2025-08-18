import type { ICard } from "../interfaces";
import type { IObservable } from "../lib/Observable";

export interface IColumn {
    readonly id: string;
    
    getCards(): ICard[];
    getCardsObservable(): IObservable<ICard[]>;
    addCard(card: ICard): void;
    removeCard(card: ICard): boolean;
    canAcceptCard(card: ICard): boolean;
    getTopCard(): ICard | null;
    isEmpty(): boolean;
    getCardCount(): number;
    
    // Методы для работы со стопками карт
    canMoveStack(fromIndex: number): boolean;
    getMovableStack(fromIndex: number): ICard[];
    removeStack(fromIndex: number): ICard[];
    addStack(cards: ICard[]): void;
    canAcceptStack(cards: ICard[]): boolean;
}
