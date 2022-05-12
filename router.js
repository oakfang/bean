import { createAsyncComponent, WebComponent } from "./base.js";
import { ValueStream } from "./vstream.js";

function processHash(hash = "#/") {
  const hashlessRoute = hash.replace(/^#/, "");
  const [rawPath, search] = hashlessRoute.split("?");
  const searchParams = new URLSearchParams(search);
  const pathParts = rawPath.split("/");
  if (pathParts[0]) {
    pathParts.unshift("");
  }
  const path = pathParts.join("/");
  return { searchParams, path };
}

export function createPageStream() {
  if (!window.location.hash) {
    window.history.replaceState(null, document.title, "/#/");
  }
  const pageStream = new ValueStream(processHash(window.location.hash));
  const onHashChange = () => {
    pageStream.update(() => processHash(window.location.hash));
  };
  window.addEventListener("hashchange", onHashChange);

  const preventDefault = (e) => e.preventDefault();
  window.addEventListener("popstate", preventDefault);

  Object.defineProperty(pageStream, "stop", {
    value() {
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("popstate", preventDefault);
    },
  });

  return pageStream;
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

  async forkPageUpdates() {
    for await (const pageParams of this.pageStream) {
      if (!this.isConnected) {
        this.pageStream.stop();
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
    if (!this.pageStream) {
      this.pageStream = createPageStream();
    }
    this.forkPageUpdates();
  }
}.setup());

export function createRouter(routingCallback, pageStream) {
  const router = document.createElement("app-router");
  router.routingCallback = routingCallback;
  router.pageStream = pageStream;

  return router;
}
