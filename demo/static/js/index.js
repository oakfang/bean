import { createRouter } from "https://cdn.jsdelivr.net/gh/oakfang/bean/router.js";

const router = createRouter(({ pathname }) => {
  switch (pathname) {
    case "/": {
      return import("./home.js");
    }
    default: {
      return import("./404.js");
    }
  }
});

document.body.appendChild(router);
