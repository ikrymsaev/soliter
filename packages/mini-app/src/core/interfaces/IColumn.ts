import type { ICard } from "../interfaces";
import type { IObservable } from "../lib/Observable";
import type { ISlot } from "./ISlot";

export interface IColumn extends ISlot {
    readonly id: string;
    
    getCards(): ICard[];
    getCardsObservable(): IObservable<ICard[]>;
    getTopCard(): ICard | null;
    getCardCount(): number;
    
    // Методы для работы со стопками карт
    canMoveStack(fromIndex: number): boolean;
    getMovableStack(fromIndex: number): ICard[];
    removeStack(fromIndex: number): ICard[];
    addStack(cards: ICard[]): void;
    canAcceptStack(cards: ICard[]): boolean;
}
