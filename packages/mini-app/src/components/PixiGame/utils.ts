import { Card, Column, DrawnCards, ResultSlot, TempSlot, EmptySlot, CardStack } from "./objects";
import * as PIXI from "pixi.js"


export const isCard = (el: PIXI.Container) => el instanceof Card;
export const isColumn = (el: PIXI.Container) => el instanceof Column;
export const isTempSlot = (el: PIXI.Container) => el instanceof TempSlot;
export const isResultSlot = (el: PIXI.Container) => el instanceof ResultSlot;
export const isDrawnSlot = (el: PIXI.Container) => el instanceof DrawnCards;
export const isEmptySlot = (el: PIXI.Container) => el instanceof EmptySlot;
export const isCardStack = (el: PIXI.Container) => el instanceof CardStack;

// Проверяем, является ли элемент Deck'ом (используется в UIController)
export const isDeck = (el: PIXI.Container): boolean => {
    // Поскольку Deck не экспортируется из objects, используем проверку по классу
    return el.constructor.name === 'Deck';
};


export const findTargetSlot = (gameScene: PIXI.Container, point: PIXI.Point): Column | TempSlot | ResultSlot | null => {
    if (!gameScene) return null;

    // Проверяем buckets в порядке приоритета (сверху вниз по z-index)
    const buckets = gameScene.children.filter(child => child.visible);
    
    for (let i = buckets.length - 1; i >= 0; i--) {
        const bucket = buckets[i] as PIXI.Container;
        const result = checkBucketForSlot(bucket, point);
        if (result) return result;
    }

    return null;
}

const checkBucketForSlot = (bucket: PIXI.Container, point: PIXI.Point): Column | TempSlot | ResultSlot | null => {
    // Проверяем bounds bucket'а
    const bounds = bucket.getBounds();
    if (point.x < bounds.x || point.x > bounds.x + bounds.width || 
        point.y < bounds.y || point.y > bounds.y + bounds.height) {
        return null;
    }

    // Проверяем прямые дочерние элементы bucket'а (slots/columns)
    const slots = bucket.children.filter(child => child.visible);
    
    for (let i = slots.length - 1; i >= 0; i--) {
        const slot = slots[i] as PIXI.Container;
        const slotBounds = slot.getBounds();
        
        if (point.x >= slotBounds.x && point.x <= slotBounds.x + slotBounds.width && 
            point.y >= slotBounds.y && point.y <= slotBounds.y + slotBounds.height) {
            
            // Проверяем тип слота
            if (isColumn(slot)) return slot as Column;
            if (isTempSlot(slot)) return slot as TempSlot;
            if (isResultSlot(slot)) return slot as ResultSlot;
        }
    }

    return null;
}

// Функция для поиска визуального элемента карты по её данным
export const findCardElement = (container: PIXI.Container, cardData: any): Card | null => {
    // Рекурсивно ищем карту во всех дочерних элементах
    for (const child of container.children) {
        if (isCard(child) && (child as Card).data === cardData) {
            return child as Card;
        }
        // Рекурсивно ищем в дочерних контейнерах
        if (child instanceof PIXI.Container) {
            const found = findCardElement(child, cardData);
            if (found) return found;
        }
    }
    return null;
}

// Функция для поиска визуального контейнера слота по данным слота
export const findSlotElement = (container: PIXI.Container, slotData: any): PIXI.Container | null => {
    // Рекурсивно ищем слот во всех дочерних элементах
    for (const child of container.children) {
        // Проверяем, есть ли у элемента свойство data и совпадает ли оно
        if ((child as any).data === slotData) {
            return child;
        }
        // Рекурсивно ищем в дочерних контейнерах
        if (child instanceof PIXI.Container) {
            const found = findSlotElement(child, slotData);
            if (found) return found;
        }
    }
    return null;
}