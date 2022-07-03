import { WebComponent } from "/bean.js";
import "./app-bar.js";

export default class extends WebComponent {
  static tagName = "app-about";
  static html = `
     <app-bar></app-bar>
     <h1>About Page</h1>
     <p>Lorem ipsum...</p>
  `;

  static {
    this.setup();
  }
}
