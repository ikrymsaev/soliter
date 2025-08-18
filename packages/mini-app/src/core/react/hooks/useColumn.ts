import { useController } from "./useController";
import { useObserve } from "./useObserve";
import type { IColumn } from "@/core/interfaces";

export const useColumn = (columnId: string): IColumn | null => {
    const controller = useController();
    const { columns } = controller.getAllSlots();
    return columns.find(col => col.id === columnId) || null;
};

export const useColumnCards = (columnId: string) => {
    const column = useColumn(columnId);
    if (!column) return [];
    return useObserve(column.getCardsObservable());
};
