import { WebComponent } from "/bean.js";
import "./app-bar.js";

export default class extends WebComponent {
  static tagName = "app-not-found";
  static html = `
  <h1>Error response</h1>
  <p>Error code: 404</p>
  <p>Message: File not found.</p>
  <p>Error code explanation: HTTPStatus.NOT_FOUND - Nothing matches the given URI.</p>
  `;

  static {
    this.setup();
  }
}
