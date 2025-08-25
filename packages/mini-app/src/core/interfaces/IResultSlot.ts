import type { ECardSuit, ICard } from "./ICard";
import type { IObservable } from "../lib/Observable";
import type { ISlot } from "./ISlot";

export interface IResultSlot extends ISlot {
    readonly suit: ECardSuit;
    
    getCards(): IObservable<ICard[]>;
    isFull(): boolean;
    getTopCard(): ICard | null;
}
