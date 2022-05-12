import { WebComponent, prop } from "https://cdn.jsdelivr.net/gh/oakfang/bean@cocoa/base.js";
import state from "/static/js/state.js";
import "./app-header.js";
import "./app-nav.js";

class AppPage extends WebComponent {
  static tagName = "app-page";
  static html = `
    <style>
      app-header {
        --fill: purple;
      }
    </style>
    <app-header>
      <h2 slot="extra"></h2>
      <app-nav slot="navigation">
        <nav-item to="/#/" text="Home"></nav-item>
        <nav-item to="/#/about" text="About"></nav-item>
      </app-nav>
    </app-header>
    <slot></slot>
  `;
  static handles = {
    header: (dom) => dom.querySelector("app-header"),
    extra: (dom) => dom.querySelector("app-header h2"),
  };
  [prop("title")](_, [title = "Todos"]) {
    this.header.setAttribute("brand", title);
  }

  async forkStateUpdates() {
    for await (let snapshot of state) {
      if (!this.isConnected) return;
      if (snapshot.todos) {
        const pendingTodos = snapshot.todos.filter(
          (todo) => !todo.completed
        ).length;
        this.extra.textContent = `${pendingTodos} pending todos`;
      } else {
        this.extra.textContent = "";
      }
    }
  }

  onBeforeMount() {
    this.forkStateUpdates();
  }
}

AppPage.setup();
