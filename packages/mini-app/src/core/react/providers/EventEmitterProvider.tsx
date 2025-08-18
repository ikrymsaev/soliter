import { createContext, useMemo } from "react";
import { EventEmitter } from "../../lib/EventEmitter";

export const EventEmitterContext = createContext<EventEmitter>(new EventEmitter());

export const EventEmitterProvider = ({ children }: { children: React.ReactNode }) => {
    const eventEmitter = useMemo(() => new EventEmitter(), []);
    
    return <EventEmitterContext.Provider value={eventEmitter}>{children}</EventEmitterContext.Provider>;
}
