import type { IObservable } from "@/core/lib/Observable"
import { useSyncExternalStore } from "react"

export function useObserve<T>(o: IObservable<T>): T {
    return useSyncExternalStore(
        o.subscribe,
        o.get
    )
}
  