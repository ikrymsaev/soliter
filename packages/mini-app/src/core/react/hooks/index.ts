// Основные хуки
export { useController, useControllerActions } from './useController';
export { useEventEmitter, useEmitEvent, useOnEvent } from './useEventEmitter';
export { useObserve as useObservable } from './useObserve';
export { useClicksState, useSelectedCard } from './useControllerStates';

// Специализированные хуки
export { useTempBucket, useTempSlot, useTempSlotCard } from './useTempBucket';
export { useColumn, useColumnCards } from './useColumn';
export { useDrawnCards, useDrawnCardsCards, useDeckCardCount } from './useDrawnCards';

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
