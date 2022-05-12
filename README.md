# bean

An unapologetically modern, build-free, Frontend infrastructure

## Current Release: **Cocoa**

Features:

- Zero build tools
- Enhanced Web Components
- Stream based state updates
- Hash routing (waiting on the [navigation API](https://chromestatus.com/feature/6232287446302720) for better routing)

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
