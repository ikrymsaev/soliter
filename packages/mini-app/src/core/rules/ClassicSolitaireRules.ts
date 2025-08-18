import type { IGameRules } from "../interfaces/IGameRules";
import type { ICard } from "../interfaces/ICard";
import { ECardType } from "../interfaces/ICard";
import { Column } from "../objects/Column";
import { TempBucket } from "../objects/TempBucket";
import { TempSlot } from "../objects/TempSlot";
import { Deck } from "../objects/Deck";
import { ResultSlot } from "../objects/ResultSlot";
import { ColumnRules } from "./ColumnRules";
import { ResultSlotRules } from "./ResultSlotRules";
import { TempBucketRules } from "./TempBucketRules";
import type { IColumn, IDeck, IResultBucket, IResultSlot, ITempBucket, ITempSlot } from "../interfaces";

export class ClassicSolitaireRules implements IGameRules {
    private columnRules = new ColumnRules();
    private resultSlotRules = new ResultSlotRules();
    private tempBucketRules = new TempBucketRules();
    
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
        targetSlot: IColumn | IResultSlot | ITempBucket | ITempSlot | IDeck,
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
    
    canMoveCardGroup(cards: ICard[], targetSlot: IColumn | IResultSlot | ITempBucket): boolean {
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
    
    getAvailableMoves(
        card: ICard,
        allSlots: {
            columns: IColumn[];
            result: IResultSlot[];
            temp: ITempBucket;
            deck: IDeck;
        }
    ): Array<IColumn | IResultSlot | ITempBucket | IDeck> {
        const availableMoves: Array<IColumn | IResultSlot | ITempBucket | IDeck> = [];
        
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
            case ECardType.ACE: return 1;
            case ECardType.TWO: return 2;
            case ECardType.THREE: return 3;
            case ECardType.FOUR: return 4;
            case ECardType.FIVE: return 5;
            case ECardType.SIX: return 6;
            case ECardType.SEVEN: return 7;
            case ECardType.EIGHT: return 8;
            case ECardType.NINE: return 9;
            case ECardType.TEN: return 10;
            case ECardType.JACK: return 11;
            case ECardType.QUEEN: return 12;
            case ECardType.KING: return 13;
            default: return 0;
        }
    }
}
