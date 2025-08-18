import type { ICard } from "../interfaces";

export interface ISlotRules<T = any> {
    canAcceptCard(slot: T, card?: ICard): boolean;
}
