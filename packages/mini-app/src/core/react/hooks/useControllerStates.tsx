import type { ICard } from "@/core/interfaces";
import { useController } from "./useController";
import { useObserve } from "./useObserve";

export const useClicksState = (): number => {
    const controller = useController();
    return useObserve(controller.clicks);
};

export const useSelectedCard = (): ICard | null => {
    const controller = useController();
    return useObserve(controller.selectedCard);
};
