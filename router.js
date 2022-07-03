import { createAsyncComponent, WebComponent, child } from "./base.js";
import { ValueStream } from "./vstream.js";

export class PageProvider {
  constructor() {
    this.stream = new ValueStream(this.getPage(window.location.href));
  }

  getPage = (href) => {
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

export class AppRouter extends WebComponent {
  static tagName = "app-router";
  static html = `
    <style>
      div {
        height: var(--router-height, 100%);
        width: var(--router-width, 100%);
      }
    </style>
    <div></div>
  `;

  container = child("div");

  #pageProvider = new PageProvider();

  onAfterMount() {
    if (!this.routingCallback) {
      throw new Error("No routing callback provided");
    }
    this.#pageProvider.attachEvents();
    this.reactTo(this.#pageProvider.stream, async (pageParams) => {
      const page = await createAsyncComponent(this.routingCallback(pageParams));
      page.params = pageParams;
      this.container.replaceChildren(page);
    });
  }

  onAfterUnmount() {
    this.#pageProvider.detachEvents();
  }

  static {
    this.setup();
  }
}

export function createRouter(routingCallback) {
  const router = document.createElement("app-router");
  router.routingCallback = routingCallback;

  return router;
}
