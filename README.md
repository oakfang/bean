# bean

An unapologetically modern, build-free, Frontend infrastructure

## Current Release: **Coffee**

Features:

- Zero build tools
- Enhanced Web Components
- Stream based state updates
- Fully native SPA routing
  - Falling back to hash routing if unsupported (temporarily, while unavailable in Chrome proper)

## Usage

### WebComponents

```js
import {
  WebComponent,
  prop,
  on,
} from "https://cdn.jsdelivr.net/gh/oakfang/bean/base.js";

(class extends WebComponent {
  static tagName = "my-component";
  static html = `
    <style>
        :host {
            display: block;
        }
        p {
            color: var(--text, black);
        }
    </style>
    <p></p>
  `;
  static handles = {
    text: (dom) => dom.querySelector("p"),
  };

  [prop("text")](_, [newText]) {
    this.text.innerText = newText;
  }

  [on("click")]() {
    console.log("clicked");
  }
}.setup());
```

### State

```js
import { ValueStream } from "https://cdn.jsdelivr.net/gh/oakfang/bean/vstream.js";

const stateManager = new ValueStream({
  todos: null,
});

(async () => {
  for await (let { todos } of stateManager) {
    console.log(todos);
  }
})();

stateManager.update((current) => ({ ...current, todos: ["a", "b", "c"] }));
```

### Routing

```js
import { createRouter } from "https://cdn.jsdelivr.net/gh/oakfang/bean/router.js";

const router = createRouter(({ path }) => {
  switch (path) {
    case "/": {
      return import("./home.js");
    }
    default: {
      return import("./404.js");
    }
  }
});

document.body.appendChild(router);
```

> Or, y'know, just take a look at the Demo.
