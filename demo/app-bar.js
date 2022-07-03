import { WebComponent, child } from "/bean.js";
import { state } from "./state.js";

export default class extends WebComponent {
  static tagName = "app-bar";
  static html = `
    <style>
      nav {
        display: flex;
        justify-content: space-between;
      }

      ul {
        display: flex;
        gap: 10px;
        list-style-type: none;
      }
    </style>
    <nav>
        <h2>Demo Count: <span></span></h2>
        <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/about">About</a></li>
        </ul>
    </nav>
  `;

  count = child("span");

  onAfterMount() {
    this.reactTo(state, ({ count }) => {
      this.count.textContent = count;
    });
  }

  static {
    this.setup();
  }
}
