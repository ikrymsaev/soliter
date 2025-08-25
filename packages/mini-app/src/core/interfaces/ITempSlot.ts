import type { ICard } from "./ICard";
import type { IObservable } from "../lib/Observable";
import type { ISlot } from "./ISlot";

export interface ITempSlot extends ISlot {
    readonly card: IObservable<ICard | null>;
}
