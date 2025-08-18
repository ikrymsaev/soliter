import { ECardSuit, ECardType, type ICard, type ICardSuit, type ICardType } from "../interfaces/ICard";

// Card class
export class Card implements ICard {
  constructor(
    public cardType: ECardType,
    public cardSuit: ECardSuit
  ) {}

  // Get the full card type info
  getCardTypeInfo(): ICardType {
    return CARD_TYPES.find(ct => ct.type === this.cardType)!;
  }

  // Get the full card suit info
  getCardSuitInfo(): ICardSuit {
    return CARD_SUITS.find(cs => cs.suit === this.cardSuit)!;
  }

  // Get card display name
  getDisplayName(): string {
    const typeInfo = this.getCardTypeInfo();
    const suitInfo = this.getCardSuitInfo();
    return `${typeInfo.name}${suitInfo.name}`;
  }
}

// Card types data
export const CARD_TYPES: ICardType[] = [
    { type: ECardType.ACE, name: "A", order: 13 },
    { type: ECardType.TWO, name: "2", order: 12 },
    { type: ECardType.THREE, name: "3", order: 11 },
    { type: ECardType.FOUR, name: "4", order: 10 },
    { type: ECardType.FIVE, name: "5", order: 9 },
    { type: ECardType.SIX, name: "6", order: 8 },
    { type: ECardType.SEVEN, name: "7", order: 7 },
    { type: ECardType.EIGHT, name: "8", order: 6 },
    { type: ECardType.NINE, name: "9", order: 5 },
    { type: ECardType.TEN, name: "10", order: 4 },
    { type: ECardType.JACK, name: "J", order: 3 },
    { type: ECardType.QUEEN, name: "Q", order: 2 },
    { type: ECardType.KING, name: "K", order: 1 },
];

// Card suits data
export const CARD_SUITS: ICardSuit[] = [
  { suit: ECardSuit.BOOBY, name: "♦", color: "red" },
  { suit: ECardSuit.CHERVY, name: "♥",  color: "red" },
  { suit: ECardSuit.PICKY, name: "♠",  color: "black" },
  { suit: ECardSuit.TREF, name: "♣",  color: "black" }
];
