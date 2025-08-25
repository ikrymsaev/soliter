import type { ICard } from "@/core/interfaces";
import type * as PIXI from "pixi.js";

export type DragStartEvent = {
    card: ICard;
    element: PIXI.Container;
    sourceSlot: PIXI.Container;
    event: PIXI.FederatedPointerEvent;
}