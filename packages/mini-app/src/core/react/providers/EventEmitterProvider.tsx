import { createContext } from "react";
import { EventEmitter } from "../../lib/EventEmitter";

export const EventEmitterContext = createContext<EventEmitter>(new EventEmitter());

export const EventEmitterProvider = ({ children }: { children: React.ReactNode }) => {
    return <EventEmitterContext.Provider value={new EventEmitter()}>{children}</EventEmitterContext.Provider>;
}
