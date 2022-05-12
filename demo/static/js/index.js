import { createRouter } from "https://cdn.jsdelivr.net/gh/oakfang/bean@cocoa/router.js";

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
