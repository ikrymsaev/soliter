import { createContext, useMemo } from "react";
import { Controller } from "../../Controller";
import { useEventEmitter } from "../hooks/useEventEmitter";
import type { Game } from "../../Game";

export const ControllerContext = createContext<Controller | null>(null);

export const ControllerProvider = ({ children, game }: { children: React.ReactNode, game: Game }) => {
    const eventEmitter = useEventEmitter();

    const controller = useMemo(() => {
        return new Controller(eventEmitter, game);
    }, [eventEmitter, game]);
    
    return <ControllerContext.Provider value={controller}>{children}</ControllerContext.Provider>;
}