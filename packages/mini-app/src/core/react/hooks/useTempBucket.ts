import { useController } from "./useController";
import { useObserve } from "./useObserve";
import type { ITempSlot } from "../../interfaces";

export const useTempBucket = () => {
    const controller = useController();
    const { temp } = controller.getAllSlots();
    return temp;
};

export const useTempSlot = (index: number): ITempSlot => {
    const tempBucket = useTempBucket();
    return tempBucket.slots[index];
};

export const useTempSlotCard = (index: number) => {
    const slot = useTempSlot(index);
    return useObserve(slot.card);
};
