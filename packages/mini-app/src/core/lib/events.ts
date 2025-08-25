import type { ICard, ISlot } from "../interfaces";

// Enum'ы для типов событий
export enum EGameEvent {
    MoveCardToSlot = 'move:card:to:slot',
    MoveStackToSlot = 'move:stack:to:slot',
    SelectCard = 'select:card',
    GetCardFromDeck = 'get:card:from:deck',
}

// Enum'ы для действий
export enum EGameAction {
    MOVE = 'move',
    MOVE_STACK = 'move_stack',
    RETURN_TO_DECK = 'return_to_deck',
    DRAW_CARD = 'draw_card',
    MOVE_FROM_DECK = 'move_from_deck',
    SHUFFLE_DECK = 'shuffle_deck'
}

// Типы данных для событий
export interface CardClickEvent {
    card: any; // Card type
}

export interface MoveStackEvent {
    cards: ICard[];
    source: ISlot;
    target: ISlot;
}

export interface ClickOutsideEvent {
    // Пустое событие
}

export interface SlotClickEvent {
    slot: any; // Column | ResultSlot | TempSlot type
}

export interface ColumnClickEvent {
    slot: any; // Column type
}

export interface ResultSlotClickEvent {
    slot: any; // ResultSlot type
}

export interface TempBucketClickEvent {
    slot: any; // TempBucket type
}

export interface DeckClickEvent {
    // Пустое событие
}

export interface GameStateChangedEvent {
    action: EGameAction;
    card?: any; // Card type
    cards?: any[]; // Card[] type for stack moves
    sourceSlot?: any; // Column | ResultSlot | TempSlot type
    targetSlot?: any; // Column | ResultSlot | TempSlot type
    deck?: any; // Deck type
}

// Drag & Drop события
export interface DragStartEvent {
    card: any; // Card type
    sourceSlot: any; // Column | ResultSlot | TempSlot type
    event: DragEvent;
}

export interface DragEndEvent {
    card: any; // Card type
    event: DragEvent;
}

export interface DragOverEvent {
    targetSlot: any; // Column | ResultSlot | TempSlot type
    event: DragEvent;
}

export interface DropEvent {
    card: any; // Card type
    sourceSlot: any; // Column | ResultSlot | TempSlot type
    targetSlot: any; // Column | ResultSlot | TempSlot type
    event: DragEvent;
}

export interface MoveCardEvent<Target = ISlot, Source = ISlot> {
    card: ICard;
    target: Target;
    source: Source;
}

// Union тип для всех событий
export type GameEvent =
    | { type: EGameEvent.MoveCardToSlot; data: MoveCardEvent };

// Типизированный EventEmitter
export interface TypedEventEmitter {
    on<T>(event: EGameEvent, callback: (data: T) => void): void;
    off<T>(event: EGameEvent, callback: (data: T) => void): void;
    emit<T>(event: EGameEvent, data?: T): void;
    removeAllListeners(event?: EGameEvent): void;
    listenerCount(event: EGameEvent): number;
    eventNames(): EGameEvent[];
}
