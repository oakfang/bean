export class WebComponent extends HTMLElement {
  #connectionController = new AbortController();

  static setup() {
    const events = {};
    const attributes = [];
    Reflect.ownKeys(this.prototype)
      .filter((method) => method.includes(":"))
      .forEach((method) => {
        const [prop, event] = method.split(":");
        const fn = this.prototype[method];
        if (!prop) {
          events[event] = fn;
          return;
        }
        attributes.push(prop);
        events[method] = fn;
      });
    this.observedAttributes = attributes;
    this.events = events;
    customElements.define(this.tagName, this);
    return this;
  }

  constructor() {
    super();
    this.dom = this.attachShadow({ mode: "open" });
    
    this.#setupInDOM();
  }

  connectedCallback() {
    this.#setupDOMHandlers();
    this.#setupEventListeners();
    this.#setupDefaultAttributes();
    this.#setupInitialAttributes();
    if (this.isConnected) {
      this.onAfterMount();
    }
  }

  disconnectedCallback() {
    this.#connectionController.abort();
    this.onAfterUnmount();
  }

  #setupEventListeners() {
    const { events } = this.constructor;
    Object.keys(events).forEach((eventName) => {
      const [eventNameBase, shouldCapture] = eventName.split("^");
      const capture = shouldCapture !== undefined;
      const subject = capture ? this.dom : this;
      subject.addEventListener(
        eventNameBase,
        (event) => {
          return events[eventName].call(this, event, event.detail);
        },
        capture
      );
    });
  }

  #setupInitialAttributes() {
    const { observedAttributes } = this.constructor;
    observedAttributes.forEach((attribute) => {
      this.attributeChangedCallback(
        attribute,
        null,
        this.getAttribute(attribute)
      );
    });
  }

  #setupDOMHandlers() {
    Reflect.ownKeys(this)
      .filter((prop) => Child.is(this[prop]))
      .forEach((prop) => {
        const el = this[prop].select(this.dom);
        this[prop] = el;
      });
  }

  #setupDefaultAttributes() {
    const { defaultAttributes = {} } = this.constructor;
    Object.keys(defaultAttributes).forEach((attribute) => {
      if (!this.hasAttribute(attribute)) {
        this.setAttribute(attribute, defaultAttributes[attribute]);
      }
    });
  }

  #createRootElement() {
    const template = document.createElement("template");
    template.innerHTML = this.constructor.html ?? "";
    const root = template.content.cloneNode(true);
    return root;
  }

  #setupInDOM() {
    this.dom.appendChild(this.#createRootElement());
  }

  get connectionSignal() {
    return this.#connectionController.signal;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this.emit(
      `${name}:change`,
      [newValue ?? undefined, oldValue ?? undefined],
      {
        bubbles: false,
      }
    );
  }

  emit(eventName, value, options = {}) {
    const event = new CustomEvent(eventName, {
      bubbles: true,
      composed: true,
      detail: value,
      ...options,
    });
    this.dispatchEvent(event);
  }

  closestElement(selector) {
    let el = this;
    let result = el.closest(selector);
    while (!result && el !== document && el !== window && el) {
      el = el.getRootNode().host;
      result = el.closest(selector);
    }
    return result;
  }

  async reactTo(stream, callback) {
    const signal = this.connectionSignal;
    for await (let snapshot of stream.untilCancelled({ signal })) {
      await callback(snapshot);
    }
  }

  onAfterMount() {
    // do nothing
  }

  onAfterUnmount() {
    // do nothing
  }
}

export async function createAsyncComponent(
  componentModule,
  exportedAs = "default"
) {
  const module = await componentModule;
  const View = module[exportedAs];
  return document.createElement(View.tagName);
}

export const on = (eventName) => ":" + eventName;

export const prop = (attr) => `${attr}:change`;

class Child {
  constructor(selector) {
    this.selector = selector;
  }

  select(dom) {
    return dom.querySelector(this.selector);
  }

  static is(value) {
    return value instanceof this;
  }
}

export const child = (selector) => new Child(selector);
