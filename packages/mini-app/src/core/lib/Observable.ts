class Observable<T = null> {
  private observers: Set<(value: T) => void> = new Set()
  constructor(private value: T) {}
  get = () => this.value
  set = (value: T | ((value: T) => T)) => {
    if (value === this.value) return
    this.value = typeof value === 'function' ? (value as (value: T) => T)(this.value) : value
    this.notify(this.value)
  }
  subscribe = (callback: (value: T) => void) => {
    this.observers.add(callback)
    return () => this.unsubscribe(callback)
  }
  unsubscribe = (callback: (value: T) => void) => {
    this.observers.delete(callback)
  }
  private notify = (value: T) => {
    this.observers.forEach((callback) => callback(value))
  }
}

type UnsubscribeFn = () => void
type SelectorFn<D extends IObservable> = (arg: ReturnType<D['get']>) => any
type ListenerFn<T> = (val: T) => void

export interface IObservable<T = any> {
  get(): T
  set(value: T | ((value: T) => T)): void
  subscribe(callback: (value: T) => void): UnsubscribeFn
}

export const observable = <T>(value: T): IObservable<T> => new Observable<T>(value)

class ObservedSelector<D extends IObservable, S extends SelectorFn<D>, R extends ReturnType<S>> {
  private subscribedValue!: ReturnType<D['get']>
  private listeners: Set<ListenerFn<ReturnType<S>>> = new Set()
  private computedValue?: R

  constructor(dep: D, selector: S) {
    this.subscribedValue = dep.get()
    dep.subscribe((newValue) => {
      this.subscribedValue = newValue
      this.onChange(selector)
    })
    this.onChange(selector)
  }
  set = () => {
    return
  }
  get = (): R => {
    return this.computedValue as R
  }
  subscribe = (listener: ListenerFn<ReturnType<S>>): UnsubscribeFn => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private onChange = (selector: S): void => {
    const newValue = selector(this.subscribedValue)
    if (this.computedValue !== newValue) {
      this.computedValue = newValue
      this.listeners.forEach((listener) => listener(newValue))
    }
  }
}

export const selector = <D extends IObservable, S extends SelectorFn<D>, R extends ReturnType<S>>(
  dep: D,
  selectorFn: S
): IObservable<R> => new ObservedSelector(dep, selectorFn)

// Упрощенная типизация с использованием infer
type ExtractObservableTypes<T extends readonly IObservable[]> = {
  [K in keyof T]: T[K] extends IObservable<infer U> ? U : never
}

type ComputeFunction<T extends readonly IObservable[], R = any> = (
  ...args: ExtractObservableTypes<T>
) => R

type Options<R> = {
  hasDiffNf?: (prev?: R, next?: R) => boolean
}

export class ObservedComputed<
  T extends readonly IObservable[],
  F extends ComputeFunction<T, R>,
  R = ReturnType<F>
> {
  private readonly subscribedValues: ExtractObservableTypes<T> = [] as any
  private readonly options: Options<R> = {}
  private readonly listeners: Set<ListenerFn<R>> = new Set()
  private computedValue?: R

  constructor(computeFn: F, deps: T, options?: Options<R>) {
    this.options = options ?? {}
    deps.forEach((dep, index) => {
      ;(this.subscribedValues as any)[index] = dep.get()
      dep.subscribe((newValue) => {
        ;(this.subscribedValues as any)[index] = newValue
        this.onChange(computeFn)
      })
    })
    this.onChange(computeFn)
  }
  set = () => {
    return
  }
  get = (): R => {
    return this.computedValue as R
  }
  subscribe = (listener: ListenerFn<R>): UnsubscribeFn => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private onChange = (computeFn: F): void => {
    const newValue = computeFn(...this.subscribedValues)
    let hasDiff = this.computedValue !== newValue
    if (this.options.hasDiffNf) {
      hasDiff = this.options.hasDiffNf(this.computedValue, newValue)
    }
    if (hasDiff) {
      this.listeners.forEach((listener) => listener(newValue))
    }
    this.computedValue = newValue
  }
}

export const computed = <
  T extends readonly IObservable[],
  F extends ComputeFunction<T, R>,
  R = ReturnType<F>
>(
  computeFn: F,
  deps: T,
  options?: Options<R>
): IObservable<R> => new ObservedComputed(computeFn, deps, options)
