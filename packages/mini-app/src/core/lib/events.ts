// Enum'ы для типов событий
export enum EGameEvent {
    CARD_CLICK = 'card:click',
    CLICK_OUTSIDE = 'click:outside',
    SLOT_CLICK = 'slot:click',
    COLUMN_CLICK = 'column:click',
    RESULT_SLOT_CLICK = 'result:slot:click',
    TEMP_BUCKET_CLICK = 'temp:bucket:click',
    DECK_CLICK = 'deck:click',
    GAME_STATE_CHANGED = 'game:state:changed',
    DRAG_START = 'drag:start',
    DRAG_END = 'drag:end',
    DRAG_OVER = 'drag:over',
    DROP = 'drop',
    DROP_TO_TEMP_BUCKET = 'drop:to:temp:bucket',
    DROP_TO_RESULT_BUCKET = 'drop:to:result:bucket',
    DROP_TO_COLUMN = 'drop:to:column'
}

// Enum'ы для действий
export enum EGameAction {
    MOVE = 'move',
    RETURN_TO_DECK = 'return_to_deck',
    DRAW_CARD = 'draw_card',
    MOVE_FROM_DECK = 'move_from_deck',
    SHUFFLE_DECK = 'shuffle_deck'
}

// Типы данных для событий
export interface CardClickEvent {
    card: any; // Card type
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

// Union тип для всех событий
export type GameEvent = 
    | { type: EGameEvent.CARD_CLICK; data: CardClickEvent }
    | { type: EGameEvent.CLICK_OUTSIDE; data: ClickOutsideEvent }
    | { type: EGameEvent.SLOT_CLICK; data: SlotClickEvent }
    | { type: EGameEvent.COLUMN_CLICK; data: ColumnClickEvent }
    | { type: EGameEvent.RESULT_SLOT_CLICK; data: ResultSlotClickEvent }
    | { type: EGameEvent.TEMP_BUCKET_CLICK; data: TempBucketClickEvent }
    | { type: EGameEvent.DECK_CLICK; data: DeckClickEvent }
    | { type: EGameEvent.GAME_STATE_CHANGED; data: GameStateChangedEvent }
    | { type: EGameEvent.DRAG_START; data: DragStartEvent }
    | { type: EGameEvent.DRAG_END; data: DragEndEvent }
    | { type: EGameEvent.DRAG_OVER; data: DragOverEvent }
    | { type: EGameEvent.DROP; data: DropEvent };

// Типизированный EventEmitter
export interface TypedEventEmitter {
    on<T>(event: EGameEvent, callback: (data: T) => void): void;
    off<T>(event: EGameEvent, callback: (data: T) => void): void;
    emit<T>(event: EGameEvent, data?: T): void;
    removeAllListeners(event?: EGameEvent): void;
    listenerCount(event: EGameEvent): number;
    eventNames(): EGameEvent[];
}
