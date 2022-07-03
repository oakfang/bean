import { WebComponent } from "/bean.js";

export default class extends WebComponent {
  static tagName = "ui-button";
  static html = `
        <style>
            button {
                background-color: #4CAF50;
                border: none;
                color: white;
                padding: 15px 32px;
            }
        </style>
        <button><slot></slot></button>
    `;

  static {
    this.setup();
  }
}
