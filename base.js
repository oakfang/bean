export class WebComponent extends HTMLElement {
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
    this.template = document.createElement("template");
    this.template.innerHTML = this.constructor.html ?? "";
    this.#setupInDOM();
  }

  connectedCallback() {
    const { defaultAttributes = {} } = this.constructor;
    Object.keys(defaultAttributes).forEach((attribute) => {
      this.setAttribute(attribute, defaultAttributes[attribute]);
    });
    if (this.isConnected) {
      this.onAfterMount();
    }
  }

  disconnectedCallback() {
    this.onAfterUnmount();
  }

  #setupInDOM() {
    const root = this.template.content.cloneNode(true);
    Object.keys(this.constructor.handles ?? {}).forEach((handle) => {
      const handler = this.constructor.handles[handle];
      Object.defineProperty(this, handle, {
        value:
          typeof handler === "function"
            ? handler(root)
            : new DocumentFragment(),
      });
    });
    const { events, observedAttributes } = this.constructor;
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

    observedAttributes.forEach((attribute) => {
      this.attributeChangedCallback(
        attribute,
        null,
        this.getAttribute(attribute)
      );
    });

    this.dom.appendChild(root);
    this.onBeforeMount();
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

  onBeforeMount() {
    // do nothing
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
