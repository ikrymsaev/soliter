import { Card, Column, Deck, DrawnCards, ResultSlot, TempSlot } from "./objects";
import * as PIXI from "pixi.js"


export const isCard = (el: PIXI.Container) => el instanceof Card;
export const isColumn = (el: PIXI.Container) => el instanceof Column;
export const isTempSlot = (el: PIXI.Container) => el instanceof TempSlot;
export const isResultSlot = (el: PIXI.Container) => el instanceof ResultSlot;
export const isDeck = (el: PIXI.Container) => el instanceof Deck;
export const isDrawnSlot = (el: PIXI.Container) => el instanceof DrawnCards;


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