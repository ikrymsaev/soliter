import * as PIXI from "pixi.js"

export enum EPixiEvent {
    TryDrag = "card:drag.try.start",
    StartDrag = "card:drag.start",
    DragOver = "card:drag.over",
    DragDrop = "card:drag.drop",
    Cancel = "card:drag.cancel",
    Click = "card:click",
}

export type TDragStartEvent = {
    element: PIXI.Container
    event: PIXI.FederatedPointerEvent
}

export type TDragDropEvent = {
    element: PIXI.Container
    source: PIXI.Container
    targetPoint: PIXI.Point
}

export type TDragCancelEvent = {
    element: PIXI.Container
    source: PIXI.Container
}

export type TElementClickEvent = {
    element: PIXI.Container
}