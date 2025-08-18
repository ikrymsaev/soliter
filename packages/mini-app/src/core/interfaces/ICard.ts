// Card suit enum
export enum ECardSuit {
    BOOBY = "♦",
    CHERVY = "♥", 
    PICKY = "♠",
    TREF = "♣"
  }
  
  // Card type enum
  export enum ECardType {
      ACE = "A",
      TWO = "2",
      THREE = "3",
      FOUR = "4",
      FIVE = "5",
      SIX = "6",
      SEVEN = "7",
      EIGHT = "8",
      NINE = "9",
      TEN = "10",
      JACK = "J",
      QUEEN = "Q",
      KING = "K",
  }
  
  // Card type interface
  export interface ICardType {
    type: ECardType;
    name: string;
    order: number;
  }
  
  // Card suit interface
  export interface ICardSuit {
    suit: ECardSuit;
    name: string;
    color: "red" | "black";
  }

export interface ICard {
    readonly cardType: ECardType;
    readonly cardSuit: ECardSuit;
    
    getCardTypeInfo(): ICardType;
    getCardSuitInfo(): ICardSuit;
    getDisplayName(): string;
}
