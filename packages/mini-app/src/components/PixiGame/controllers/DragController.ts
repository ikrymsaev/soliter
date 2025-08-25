import { EPixiEvent } from "../events";
import type { DragLayer } from "../layers/DragLayer";
import * as PIXI from "pixi.js"
import { findTargetSlot } from "../utils";

type DragStartEvent = {
    element: PIXI.Container;
    event: PIXI.FederatedPointerEvent;
}
const DEFAULT_POSITION = { x: 0, y: 0 };

export class DragController {
    private readonly DRAG_THRESHOLD = 5;
    
    private draggedEl: PIXI.Container | null = null;
    private source: PIXI.Container | null = null;

    private dragOffset = DEFAULT_POSITION;
    private originalPosition = DEFAULT_POSITION;
    private dragStartPosition = DEFAULT_POSITION;

    private isDragging = false;
    private isDragStarted = false;

    constructor(
        private readonly dragLayer: DragLayer,
        private readonly pixiEmitter: PIXI.EventEmitter 
    ) {}
    
    startDrag = (data: DragStartEvent) => {
        console.log("startDrag")
        if (this.isDragging) return;

        const { element, event } = data;
        
        this.source = element.parent;
        this.dragStartPosition = { x: event.global.x, y: event.global.y };
        this.isDragStarted = true;
        this.draggedEl = element;

        if (!element) {
            this.isDragStarted = false;
            this.source = null;
            this.draggedEl = null;
            return;
        }

        this.originalPosition = { x: element.x, y: element.y };
        this.addGlobalEventListeners();
    }

    getDragInfo() {
        return {
            draggedEl: this.draggedEl,
            source: this.source,
            originalPosition: this.originalPosition,
            isDragging: this.isDragging
        };
    }

    restoreElement = () => {
        if (this.draggedEl && this.source) {
            // Удаляем элемент из dragLayer если он там находится
            if (this.draggedEl.parent === this.dragLayer) {
                this.dragLayer.removeChild(this.draggedEl);
            }
            
            // Возвращаем элемент в исходный контейнер
            this.source.addChild(this.draggedEl);
            this.draggedEl.x = this.originalPosition.x;
            this.draggedEl.y = this.originalPosition.y;
            
            // Сбрасываем состояние перетаскивания
            this.isDragging = false;
            this.isDragStarted = false;
            this.draggedEl = null;
            this.source = null;
            this.originalPosition = DEFAULT_POSITION;
            this.dragOffset = DEFAULT_POSITION;
            
            // Отключаем интерактивность DragLayer
            this.dragLayer.eventMode = 'none';
            
            // Удаляем глобальные обработчики
            this.removeGlobalEventListeners();
        }
    }

    endDrag = () => {
        this.removeGlobalEventListeners();
        if (!this.isDragging) return;

        // Удаляем перетаскиваемую карту из dragLayer
        if (this.draggedEl && this.draggedEl.parent === this.dragLayer) {
            this.dragLayer.removeChild(this.draggedEl);
        }

        // Отключаем интерактивность DragLayer
        this.dragLayer.eventMode = 'none';
        
        // Сбрасываем состояние
        this.isDragging = false;
        this.isDragStarted = false;
        this.draggedEl = null;
        this.source = null;
        this.originalPosition = DEFAULT_POSITION;
        this.dragOffset = DEFAULT_POSITION;
    }

    completeDrag = () => {
        // Завершает перетаскивание без восстановления карты
        // (карта уже перемещена в новое место через игровую логику)
        this.removeGlobalEventListeners();
        
        // Удаляем карту из dragLayer если она там
        if (this.draggedEl && this.draggedEl.parent === this.dragLayer) {
            this.dragLayer.removeChild(this.draggedEl);
        }

        // Отключаем интерактивность DragLayer
        this.dragLayer.eventMode = 'none';
        
        // Сбрасываем состояние
        this.isDragging = false;
        this.isDragStarted = false;
        this.draggedEl = null;
        this.source = null;
        this.originalPosition = DEFAULT_POSITION;
        this.dragOffset = DEFAULT_POSITION;
    }

    private updateDragPosition(globalX: number, globalY: number) {
        if (!this.draggedEl) return;
        this.draggedEl.x = globalX - this.dragOffset.x;
        this.draggedEl.y = globalY - this.dragOffset.y;
    }

    private addGlobalEventListeners() {
        document.addEventListener('mousemove', this.onGlobalMouseMove);
        document.addEventListener('mouseup', this.onGlobalMouseUp);
    }

    private removeGlobalEventListeners() {
        document.removeEventListener('mousemove', this.onGlobalMouseMove);
        document.removeEventListener('mouseup', this.onGlobalMouseUp);
    }
    
    private onGlobalMouseMove = (event: MouseEvent) => {
        // Конвертируем координаты мыши в координаты PIXI
        const canvas = document.querySelector('canvas');
        if (!canvas) return;
        
        const rect = canvas.getBoundingClientRect();
        const pixiX = event.clientX - rect.left;
        const pixiY = event.clientY - rect.top;
        
        // Если перетаскивание уже началось
        if (this.isDragging && this.draggedEl) {
            this.updateDragPosition(pixiX, pixiY);
            
            // Эмитим событие перетаскивания для подсветки возможных зон сброса
            this.pixiEmitter.emit(EPixiEvent.DragOver, {
                targetSlot: findTargetSlot(this.dragLayer, new PIXI.Point(pixiX, pixiY)),
                event: event
            });
            return;
        }
        
        // Если перетаскивание подготовлено, но еще не началось
        if (this.isDragStarted && this.draggedEl) {
            // Проверяем, достаточно ли мышь сдвинулась для начала перетаскивания
            const distance = Math.sqrt(
                Math.pow(pixiX - this.dragStartPosition.x, 2) + 
                Math.pow(pixiY - this.dragStartPosition.y, 2)
            );
            
            if (distance >= this.DRAG_THRESHOLD) {
                this.beginActualDrag(pixiX, pixiY);
            }
        }
    };

    private beginActualDrag(pixiX: number, pixiY: number) {
        if (!this.draggedEl) return;

        this.isDragging = true;
        this.isDragStarted = false;

        // Вычисляем смещение от точки клика до позиции карты
        const globalPos = this.draggedEl.toGlobal(new PIXI.Point(0, 0));
        this.dragOffset = {
            x: pixiX - globalPos.x,
            y: pixiY - globalPos.y
        };
        
        // Проверяем, что смещение разумное
        if (Math.abs(this.dragOffset.x) > 100 || Math.abs(this.dragOffset.y) > 100) {
            this.dragOffset = { x: 30, y: 45 }; // Центрируем карту под курсором
        }

        this.dragLayer.addChild(this.draggedEl)
        // Позиционируем перетаскиваемую карту
        this.updateDragPosition(pixiX, pixiY);
        // Включаем интерактивность DragLayer для перехвата событий мыши
        this.dragLayer.eventMode = 'static';
    }

    private onGlobalMouseUp = (event: MouseEvent) => {
        // Если перетаскивание не началось, просто отменяем подготовку
        if (!this.isDragging && !this.isDragStarted) return;
        
        // Если перетаскивание только подготовлено, но не началось - это обычный клик
        if (this.isDragStarted && !this.isDragging) {
            this.cancelDragPreparation();
            return;
        }
        
        // Конвертируем координаты мыши в координаты PIXI
        const canvas = document.querySelector('canvas');
        if (!canvas) return;
        
        const rect = canvas.getBoundingClientRect();
        const pixiX = event.clientX - rect.left;
        const pixiY = event.clientY - rect.top;
        
        this.pixiEmitter.emit(EPixiEvent.DragDrop, {
            element: this.draggedEl,
            source: this.source,
            targetPoint: new PIXI.Point(pixiX, pixiY)
        });

        this.cancelDragPreparation();
    };

    private cancelDragPreparation() {
        // Удаляем глобальные обработчики событий
        this.removeGlobalEventListeners();
        
        // Сбрасываем состояние подготовки (но НЕ восстанавливаем карту)
        this.isDragStarted = false;
        this.isDragging = false;
        this.draggedEl = null;
        this.source = null;
        this.originalPosition = DEFAULT_POSITION;
        this.dragOffset = DEFAULT_POSITION;
    }
}