import { useContext } from "react";
import { EventEmitterContext } from "../providers/EventEmitterProvider";
import { EGameEvent } from "../../lib/events";
import type { EventCallback } from "../../lib/EventEmitter";

export const useEventEmitter = () => {
    const eventEmitter = useContext(EventEmitterContext);
    if (!eventEmitter) {
        throw new Error('EventEmitterContext not found');
    }
    return eventEmitter;
}

export const useEmitEvent = () => {
    const eventEmitter = useEventEmitter();

    const emit = <T extends any>(event: EGameEvent, data?: T) => {
        eventEmitter.emit(event, data);
    }

    return { emit };
}

export const useOnEvent = () => {
    const eventEmitter = useEventEmitter();

    const on = <T extends any>(event: EGameEvent, callback: EventCallback<T>) => {
        eventEmitter.on(event, callback);
    }

    const off = <T extends any>(event: EGameEvent, callback: EventCallback<T>) => {
        eventEmitter.off(event, callback);
    }

    return { on, off };
}
