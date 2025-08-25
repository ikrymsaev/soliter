import type { ICard } from "../interfaces";
import type { IDeck, IColumn } from "../interfaces";

export interface ISlotRules<T = any> {
    canAcceptCard(slot: T, card?: ICard): boolean;
    canInteractWithCard(slot: T, card?: ICard): boolean;
    canInteractWithStack(slot: T, card?: ICard): boolean;
}

export interface IDealStrategy {
    dealCards(deck: IDeck, columns: IColumn[]): void;
}
