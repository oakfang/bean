import { WebComponent, child } from "/bean.js";
import { state } from "./state.js";
import "./app-bar.js";
import "./ui-button.js";

export default class extends WebComponent {
  static tagName = "app-home";
  static html = `
     <app-bar></app-bar>
     <h1>Hello, world!</h1>
     <ui-button>Click me!</ui-button>
  `;

  button = child("ui-button");

  onAfterMount() {
    this.button.addEventListener("click", () =>
      state.update((current) => {
        current.count++;
      })
    );
  }

  static {
    this.setup();
  }
}
