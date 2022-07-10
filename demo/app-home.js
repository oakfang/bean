import { WebComponent, child } from "/bean.js";
import { state } from "./state.js";
import "./app-bar.js";
import "./ui-button.js";

export default class extends WebComponent {
  static tagName = "app-home";
  static html = `
     <style>
      section {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
     </style>
     <app-bar></app-bar>
     <h1>Hello, world!</h1>
     <section>
      <ui-button variant="primary">Click me!</ui-button>
      <ui-button variant="secondary">Don't click me</ui-button>
      <ui-button variant="tertiary">Don't click me</ui-button>
      <ui-button variant="quaternary">Don't click me</ui-button>
      <ui-button variant="quinary">Don't click me</ui-button>
      <ui-button variant="senary">Don't click me</ui-button>
      <ui-button variant="septenary">Don't click me</ui-button>
     </section>
  `;

  button = child("ui-button[variant='primary']");

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
