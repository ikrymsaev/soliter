import { TempSlot } from "./TempSlot"

export const TempBucketCmp = () => {
    return (
        <div id="temp-slots" className="flex flex-row gap-2">
            <TempSlot index={0} />
            <TempSlot index={1} />
            <TempSlot index={2} />
            <TempSlot index={3} />
        </div>
    )
}
