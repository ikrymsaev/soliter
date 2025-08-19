import type { IGameRules } from "../../interfaces/IGameRules";
import type { ICard } from "../../interfaces/ICard";
import { ECardType } from "../../interfaces/ICard";
import { Column } from "../../objects/Column";
import { TempBucket } from "../../objects/TempBucket";
import { TempSlot } from "../../objects/TempSlot";
import { Deck } from "../../objects/Deck";
import { ResultSlot } from "../../objects/ResultSlot";
import { ColumnRules } from "./ColumnRules";
import { ResultSlotRules } from "./ResultSlotRules";
import { TempBucketRules } from "./TempBucketRules";
import { ClassicDealStrategy } from "./ClassicDealStrategy";
import type { IColumn, IDeck, IResultBucket, IResultSlot, ITempBucket, ITempSlot } from "../../interfaces";
import type { ISlotRules } from "../interfaces";
import type { IDrawnCardsArea } from "../../interfaces/IDrawnCardsArea";

export class ClassicRules implements IGameRules {
    readonly columnRules: ISlotRules<IColumn>;
    readonly resultSlotRules: ISlotRules<IResultSlot>;
    readonly tempBucketRules: ISlotRules<ITempBucket>;
    readonly columnCount: number = 8;
    readonly dealStrategy: ClassicDealStrategy;

    constructor() {
        this.columnRules = new ColumnRules();
        this.resultSlotRules = new ResultSlotRules();
        this.tempBucketRules = new TempBucketRules();
        this.dealStrategy = new ClassicDealStrategy();
    }
    
    canColumnAcceptCard(column: IColumn, card: ICard): boolean {
        return this.columnRules.canAcceptCard(column, card);
    }
    
    canResultSlotAcceptCard(resultSlot: IResultSlot, card: ICard): boolean {
        return this.resultSlotRules.canAcceptCard(resultSlot, card);
    }
    
    canTempSlotAcceptCard(tempSlot: ITempBucket): boolean {
        return this.tempBucketRules.canAcceptCard(tempSlot);
    }
    
    canMoveCard(
        targetSlot: IColumn | IResultSlot | ITempBucket | ITempSlot | IDeck | IDrawnCardsArea,
        card: ICard
    ): boolean {
        // Проверяем специфичные правила для каждого типа слота
        if (targetSlot instanceof Column) {
            return this.columnRules.canAcceptCard(targetSlot, card);
        } else if (targetSlot instanceof ResultSlot) {
            return this.resultSlotRules.canAcceptCard(targetSlot, card);
        } else if (targetSlot instanceof TempBucket) {
            return this.tempBucketRules.canAcceptCard(targetSlot);
        } else if (targetSlot instanceof Deck) {
            return true;
        } else if (targetSlot instanceof TempSlot) {
            return targetSlot.isEmpty();
        }
        
        return false;
    }
    
    canMoveCardGroup(cards: ICard[], targetSlot: IColumn | IResultSlot | ITempBucket | IDrawnCardsArea): boolean {
        // Проверяем, что карты в группе образуют валидную последовательность
        if (!this.isValidCardSequence(cards)) {
            return false;
        }
        
        // Проверяем, может ли целевой слот принять первую карту группы
        if (cards.length === 0) {
            return false;
        }
        
        const firstCard = cards[0];
        
        if (targetSlot instanceof Column) {
            return this.columnRules.canAcceptCard(targetSlot, firstCard);
        } else if (targetSlot instanceof ResultSlot) {
            // В результатный слот можно положить только одну карту
            return cards.length === 1 && this.resultSlotRules.canAcceptCard(targetSlot, firstCard);
        } else if (targetSlot instanceof TempBucket) {
            // Во временный слот можно положить только одну карту
            return cards.length === 1 && this.tempBucketRules.canAcceptCard(targetSlot);
        }
        
        return false;
    }
    
    isGameCompleted(resultBucket: IResultBucket): boolean {
        // Игра завершена, если все результатные слоты заполнены (от туза до короля)
        return resultBucket.isFull();
    }
    
    canDrawFromDeck(deck: Deck): boolean {
        // Можно вытянуть карту, если в колоде есть карты
        return deck.getCardCount() > 0;
    }
    
    canReturnCardToDeck(): boolean {
        // В классическом пасьянсе можно возвращать карты в колоду
        return true;
    }
    
    getAvailableMoves(
        card: ICard,
        allSlots: {
            columns: IColumn[];
            result: IResultSlot[];
            temp: ITempBucket;
            deck: IDeck;
            drawnCardsArea?: IDrawnCardsArea;
        }
    ): Array<IColumn | IResultSlot | ITempBucket | IDeck | IDrawnCardsArea> {
        const availableMoves: Array<IColumn | IResultSlot | ITempBucket | IDeck | IDrawnCardsArea> = [];
        
        // Проверяем все возможные целевые слоты
        for (const column of allSlots.columns) {
            if (this.columnRules.canAcceptCard(column, card)) {
                availableMoves.push(column);
            }
        }
        
        for (const resultSlot of allSlots.result) {
            if (this.resultSlotRules.canAcceptCard(resultSlot, card)) {
                availableMoves.push(resultSlot);
            }
        }
        
        if (this.tempBucketRules.canAcceptCard(allSlots.temp)) {
            availableMoves.push(allSlots.temp);
        }
        
        availableMoves.push(allSlots.deck);
        
        return availableMoves;
    }
    
    /**
     * Проверяет, образуют ли карты валидную последовательность для перемещения
     */
    private isValidCardSequence(cards: ICard[]): boolean {
        if (cards.length <= 1) {
            return true;
        }
        
        for (let i = 0; i < cards.length - 1; i++) {
            const currentCard = cards[i];
            const nextCard = cards[i + 1];
            
            const currentCardInfo = currentCard.getCardSuitInfo();
            const nextCardInfo = nextCard.getCardSuitInfo();
            
            // Карты должны быть разного цвета и идти по убыванию
            if (currentCardInfo.color === nextCardInfo.color || 
                this.getCardValue(currentCard) !== this.getCardValue(nextCard) + 1) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Получает числовое значение карты
     */
    private getCardValue(card: ICard): number {
        const cardType = card.cardType;
        switch (cardType) {
            case 'A': return 1;
            case '2': return 2;
            case '3': return 3;
            case '4': return 4;
            case '5': return 5;
            case '6': return 6;
            case '7': return 7;
            case '8': return 8;
            case '9': return 9;
            case '10': return 10;
            case 'J': return 11;
            case 'Q': return 12;
            case 'K': return 13;
            default: return 0;
        }
    }
}
