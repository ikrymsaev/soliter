import type { ECardSuit, ICard } from "./ICard";
import type { IObservable } from "../lib/Observable";

export interface IResultSlot {
    readonly suit: ECardSuit;
    
    getCards(): IObservable<ICard[]>;
    addCard(card: ICard): void;
    removeCard(card: ICard): boolean;
    canAcceptCard(card: ICard): boolean;
    isFull(): boolean;
    isEmpty(): boolean;
    getTopCard(): ICard | null;
}
