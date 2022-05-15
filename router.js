import { createAsyncComponent, WebComponent } from "./base.js";
import { ValueStream } from "./vstream.js";

export class PageProvider {
  type = "browser";

  constructor() {
    this.setup();
    this.stream = new ValueStream(this.getPage());
  }

  setup() {
    // no need to do anything
  }

  getHref() {
    return window.location.href;
  }

  getPage = (href = this.getHref()) => {
    return new URL(href);
  };

  pushPage = (href) => {
    this.stream.update(() => this.getPage(href));
  };

  #applyNavigation = (e) => {
    // Some navigations, e.g. cross-origin navigations, we cannot intercept. Let the browser handle those normally.
    if (!e.canTransition) {
      return;
    }

    // Don't intercept fragment navigations or downloads.
    if (e.hashChange || e.downloadRequest) {
      return;
    }

    e.transitionWhile(this.pushPage(e.destination.url));
  };

  attachEvents() {
    window.navigation.addEventListener("navigate", this.#applyNavigation);
  }

  detachEvents() {
    window.navigation.removeEventListener("navigate", this.#applyNavigation);
  }
}

export class HashPageProvider extends PageProvider {
  type = "hash";

  setup() {
    if (!window.location.hash) {
      window.history.replaceState(null, document.title, "/#/");
    }
  }

  getHref() {
    const hash = window.location.hash || "#/";
    const partialLocation = hash.replace(/^#/, "");
    return `${window.location.origin}${partialLocation}`;
  }

  #preventDefault(event) {
    event.preventDefault();
  }

  #applyNavigation = () => this.pushPage();

  attachEvents() {
    window.addEventListener("hashchange", this.#applyNavigation);
    window.addEventListener("popstate", this.#preventDefault);
  }

  detachEvents() {
    window.removeEventListener("hashchange", this.#applyNavigation);
    window.removeEventListener("popstate", this.#preventDefault);
  }
}

export function createPageProvider() {
  if (window.navigation) {
    return new PageProvider();
  }
  return new HashPageProvider();
}

(class AppRouter extends WebComponent {
  static tagName = "app-router";
  static html = `
    <style>
      div {
        height: 100%;
        width: 100%;
      }
    </style>
    <div></div>
  `;

  static handles = {
    container: (dom) => dom.querySelector("div"),
  };

  get type() {
    return this.pageProvider.type;
  }

  async #forkPageUpdates() {
    for await (const pageParams of this.pageProvider.stream) {
      if (!this.isConnected) {
        this.pageProvider.detachEvents();
        return;
      }
      const page = await createAsyncComponent(this.routingCallback(pageParams));
      page.params = pageParams;
      this.container.replaceChildren(page);
    }
  }

  connectedCallback() {
    super.connectedCallback();
    if (!this.routingCallback) {
      throw new Error("No routing callback provided");
    }
    if (!this.pageProvider) {
      this.pageProvider = createPageProvider();
    }
    this.pageProvider.attachEvents();
    this.#forkPageUpdates();
  }
}.setup());

export function createRouter(routingCallback, pageProvider) {
  const router = document.createElement("app-router");
  router.routingCallback = routingCallback;
  router.pageProvider = pageProvider;

  return router;
}
