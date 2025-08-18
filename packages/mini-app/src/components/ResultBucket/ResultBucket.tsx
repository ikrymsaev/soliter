import { ResultSlot } from "./ResultSlot";
import { ECardSuit } from "@/core/interfaces/ICard";

export const ResultCmp = () => {
    return (
        <div id="result-slots" className="flex flex-row gap-2">
            <ResultSlot suit={ECardSuit.BOOBY} />
            <ResultSlot suit={ECardSuit.CHERVY} />
            <ResultSlot suit={ECardSuit.PICKY} />
            <ResultSlot suit={ECardSuit.TREF} />
        </div>
    )
}
