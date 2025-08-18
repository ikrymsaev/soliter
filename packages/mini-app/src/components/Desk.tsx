import { useController } from "@/core/react/hooks/useController";
import { ColumnCmp } from "./Column/Column";

export const Desk = () => {
    const controller = useController();
    const { columns } = controller.getAllSlots();

    return (
        <div id="game-field" className="flex flex-row gap-4">
            {columns.map((column) => {
                return <ColumnCmp key={column.id} columnId={column.id} />;
            })}
        </div>
    )
}