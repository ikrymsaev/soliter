import type { ICard } from "./ICard";
import type { IObservable } from "../lib/Observable";

export interface ITempSlot {
    readonly card: IObservable<ICard | null>;
    
    removeCard(): void;
    isEmpty(): boolean;
    addCard(card: ICard): boolean;
}
