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

type DepsArr1 = [IObservable]
type DepsArr2 = [IObservable, IObservable]
type DepsArr3 = [IObservable, IObservable, IObservable]
type DepsArr4 = [IObservable, IObservable, IObservable, IObservable]
type DepsArr5 = [IObservable, IObservable, IObservable, IObservable, IObservable]
type DepsArr = DepsArr1 | DepsArr2 | DepsArr3 | DepsArr4 | DepsArr5
type SubscribetTupple = [any, any, any, any, any]
type Compute1<D extends DepsArr1> = (arg_0: ReturnType<D[0]['get']>, ...args: any[]) => any
type Compute2<D extends DepsArr2> = (
  arg_0: ReturnType<D[0]['get']>,
  arg_1: ReturnType<D[1]['get']>,
  ...args: any[]
) => any
type Compute3<D extends DepsArr3> = (
  arg_0: ReturnType<D[0]['get']>,
  arg_1: ReturnType<D[1]['get']>,
  arg_2: ReturnType<D[2]['get']>,
  ...args: any[]
) => any
type Compute4<D extends DepsArr4> = (
  arg_0: ReturnType<D[0]['get']>,
  arg_1: ReturnType<D[1]['get']>,
  arg_2: ReturnType<D[2]['get']>,
  arg_3: ReturnType<D[3]['get']>,
  ...args: any[]
) => any
type Compute5<D extends DepsArr5> = (
  arg_0: ReturnType<D[0]['get']>,
  arg_1: ReturnType<D[1]['get']>,
  arg_2: ReturnType<D[2]['get']>,
  arg_3: ReturnType<D[3]['get']>,
  arg_4: ReturnType<D[4]['get']>,
  ...args: any[]
) => any

type ComputeProps<D extends DepsArr> = D extends DepsArr1
  ? Parameters<Compute1<D>>
  : D extends DepsArr2
    ? Parameters<Compute2<D>>
    : D extends DepsArr3
      ? Parameters<Compute3<D>>
      : D extends DepsArr4
        ? Parameters<Compute4<D>>
        : D extends DepsArr5
          ? Parameters<Compute5<D>>
          : []

type Compute<D> = D extends DepsArr1
  ? Compute1<D>
  : D extends DepsArr2
    ? Compute2<D>
    : D extends DepsArr3
      ? Compute3<D>
      : D extends DepsArr4
        ? Compute4<D>
        : D extends DepsArr5
          ? Compute5<D>
          : (...args: any[]) => never

type Options<R> = {
  hasDiffNf?: (prev?: R, next?: R) => boolean
}

export class ObservedComputed<C extends Compute<D>, D extends DepsArr, R extends ReturnType<C>> {
  private readonly subscribedValues: ComputeProps<D> | [] = []
  private readonly options: Options<R> = {}
  private readonly listeners: Set<ListenerFn<R>> = new Set()
  private computedValue?: R

  constructor(computeFn: C, deps: D, options?: Options<R>) {
    this.options = options ?? {}
    deps.forEach((dep, index) => {
      this.subscribedValues[index] = dep.get()
      dep.subscribe((newValue) => {
        this.subscribedValues[index] = newValue
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

  private onChange = (computeFn: C): void => {
    const newValue = computeFn(...(this.subscribedValues as SubscribetTupple))
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

export const computed = <C extends Compute<D>, D extends DepsArr, R extends ReturnType<C>>(
  computeFn: C,
  deps: D,
  options?: Options<R>
): IObservable<R> => new ObservedComputed(computeFn, deps, options)
