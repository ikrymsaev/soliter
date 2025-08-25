import type { IColumn, IField } from "@/core/interfaces";
import * as PIXI from "pixi.js";
import { Column } from "./Column";
import type { Controller } from "@/core/GameController";
import type { EventEmitter } from "@/core/lib/EventEmitter";

export class FieldBucket extends PIXI.Container {
    private columnGap = 10;

    constructor(
        private readonly field: IField,
        private readonly controller: Controller,
        private readonly eventEmitter: EventEmitter,
        private readonly pixiEmmiter: PIXI.EventEmitter
    ) {
        super();
        console.log('FieldBucket[constructor]', this.field);
        this.render();
    }

    render() {
        const slots = this.field.getSlots();
        slots.forEach((column, index) => {
            const columnObject = new Column(
                column,
                this.controller,
                this.eventEmitter,
                this.pixiEmmiter,
            );
            columnObject.x = index * (columnObject.width + this.columnGap);
            this.addChild(columnObject);
        });
    }

    // Метод для обновления отображения
    update() {
        // Очищаем контейнер
        this.removeChildren();
        // Перерисовываем
        this.render();
    }
}