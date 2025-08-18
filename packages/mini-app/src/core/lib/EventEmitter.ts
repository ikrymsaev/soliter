import { EGameEvent, type TypedEventEmitter } from './events';

export type EventCallback<T = any> = (data: T) => void;

export class EventEmitter implements TypedEventEmitter {
    private events: { [key in EGameEvent]?: ((data: any) => void)[] } = {};

    on<T = any>(event: EGameEvent, callback: (data: T) => void): void {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event]!.push(callback);
    }

    off<T = any>(event: EGameEvent, callback: (data: T) => void): void {
        if (this.events[event]) {
            this.events[event] = this.events[event]!.filter(cb => cb !== callback);
        }
    }

    emit<T = any>(event: EGameEvent, data?: T): void {
        if (this.events[event]) {
            this.events[event]!.forEach(callback => callback(data));
        }
    }

    removeAllListeners(event?: EGameEvent): void {
        if (event) {
            delete this.events[event];
        } else {
            this.events = {};
        }
    }

    listenerCount(event: EGameEvent): number {
        return this.events[event]?.length || 0;
    }

    eventNames(): EGameEvent[] {
        return Object.keys(this.events) as EGameEvent[];
    }
}
