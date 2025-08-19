import type { IColumn } from "./IColumn";
import type { IResultSlot } from "./IResultSlot";
import type { ITempBucket } from "./ITempBucket";
import type { ITempSlot } from "./ITempSlot";
import type { IDeck } from "./IDeck";
import type { ICard } from "./ICard";
import type { IResultBucket } from "./IResultBucket";
import type { ISlotRules } from "../rules/interfaces";

export interface IGameRules {
    readonly columnRules: ISlotRules<IColumn>;
    readonly resultSlotRules: ISlotRules<IResultSlot>;
    readonly tempBucketRules: ISlotRules<ITempBucket>;

    /**
     * Проверяет, может ли колонка принять карту
     */
    canColumnAcceptCard(column: IColumn, card: ICard): boolean;
    
    /**
     * Проверяет, может ли результатный слот принять карту
     */
    canResultSlotAcceptCard(resultSlot: IResultSlot, card: ICard): boolean;
    
    /**
     * Проверяет, может ли временный слот принять карту
     */
    canTempSlotAcceptCard(tempSlot: ITempBucket, card: ICard): boolean;
    
    /**
     * Проверяет, можно ли переместить карту из одного слота в другой
     */
    canMoveCard(
        targetSlot: IColumn | IResultSlot | ITempBucket | ITempSlot | IDeck,
        card: ICard
    ): boolean;
    
    /**
     * Проверяет, можно ли переместить группу карт из колонки
     */
    canMoveCardGroup(cards: ICard[], targetSlot: IColumn | IResultSlot | ITempBucket): boolean;
    
    /**
     * Проверяет, является ли игра завершенной
     */
    isGameCompleted(resultSlot: IResultBucket): boolean;
    
    /**
     * Проверяет, можно ли вытянуть карту из колоды
     */
    canDrawFromDeck(deck: IDeck): boolean;
    
    /**
     * Получает доступные ходы для карты
     */
    getAvailableMoves(
        card: ICard,
        allSlots: {
            columns: IColumn[];
            result: IResultSlot[];
            temp: ITempBucket;
            deck: IDeck;
        }
    ): Array<IColumn | IResultSlot | ITempBucket | IDeck>;
}
