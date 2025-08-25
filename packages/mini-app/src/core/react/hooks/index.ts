// Основные хуки
export { useController } from './useController';
export { useEventEmitter } from './useEventEmitter';
export { useObserve } from './useObserve';
export { useColumn } from './useColumn';
export { useColumnCards } from './useColumn';
export { useTempBucket } from './useTempBucket';
export { useDrawnCards, useDrawnCardsCards, useDeckCardCount } from './useDrawnCards';
export { useGameState } from './useGameState';

// Специализированные хуки
export { useTempSlot, useTempSlotCard } from './useTempBucket';

// Типы событий
export { EGameEvent as GameEventType, EGameAction as GameActionType } from '../../lib/events';
export type { 
    CardClickEvent,
    ClickOutsideEvent,
    SlotClickEvent,
    DeckClickEvent,
    GameStateChangedEvent,
    GameEvent
} from '../../lib/events';
