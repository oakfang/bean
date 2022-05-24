export class ValueStream {
  #value = null;
  #resolvers = new Set();
  constructor(value = {}) {
    this.#value = value;
  }

  get current() {
    return this.#value;
  }

  async update(callback) {
    const update = await callback(this.#value);
    if (update !== undefined) {
      this.#value = update;
    }
    this.#resolvers.forEach((resolver) => resolver());
    this.#resolvers.clear();
  }

  async tx(changeCallback, effectCallback) {
    const current = structuredClone(this.#value);
    try {
      await this.update(changeCallback);
      await effectCallback(this.#value);
    } catch {
      this.update(() => current);
    }
  }

  async *[Symbol.asyncIterator]() {
    yield this.#value;
    while (true) {
      await new Promise((resolve) => {
        this.#resolvers.add(resolve);
      });
      yield this.#value;
    }
  }

  async *untilCancelled({ signal }) {
    if (signal.aborted) {
      return;
    }
    const signalTriggered = new Promise((_resolve, reject) => {
      signal.addEventListener("abort", reject, { once: true });
    });
    yield this.#value;
    try {
      while (!signal.aborted) {
        await Promise.race([
          new Promise((resolve) => {
            this.#resolvers.add(resolve);
          }),
          signalTriggered,
        ]);
        yield this.#value;
      }
    } catch {}
  }
}
