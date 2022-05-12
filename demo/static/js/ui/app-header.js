import { WebComponent, prop } from "https://cdn.jsdelivr.net/gh/oakfang/bean@cocoa/base.js";

class AppHeader extends WebComponent {
  static tagName = "app-header";
  static html = `
    <style>
        header {
            display: flex;
            padding: 5px 20px;
            justify-content: space-between;
            align-items: center;

            background-color: var(--fill, blue);
            color: var(--text, white);
        }
    </style>
    <header>
        <h1></h1>
        <slot name="extra"></slot>
        <section>
            <slot name="navigation"></slot>
        </section>
    </header>
  `;
  static handles = {
    brand: (dom) => dom.querySelector("h1"),
  };

  [prop("brand")](_, [brand]) {
    this.brand.textContent = brand;
  }
}

AppHeader.setup();
