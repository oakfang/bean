import { createRouter } from "/bean.js";
import "./ui-theme.js";

const theme = document.createElement("ui-theme");
theme.appendChild(
  createRouter(({ pathname }) => {
    switch (pathname) {
      case "/": {
        return import("/demo/app-home.js");
      }
      case "/about": {
        return import("/demo/app-about.js");
      }
      default: {
        return import("/demo/app-404.js");
      }
    }
  })
);

document.body.appendChild(theme);
