import { WebComponent, createAsyncComponent } from "https://cdn.jsdelivr.net/gh/oakfang/bean/base.js";
import "./ui/app-page.js";

class HomePage extends WebComponent {
  static tagName = "home-page";
  static html = `
    <style>
      app-page {
        display: flex;
        flex-direction: column;
        height: 100%;
        background-color: #310363;
      }
      h1 {
        color: white;
        align-self: center;
      }
      section {
        color: white;
        display: flex;
        justify-content: center;
        flex: 1;
        overflow: auto;
        height: 100%;
      }
    </style>
    <app-page>
      <h1>Todo List</h1>
      <section>
        <p>Loading...</p>
      </section>
    </app-page>
  `;

  static handles = {
    todosSection: (dom) => dom.querySelector("section"),
  };

  async onBeforeMount() {
    const todosSection = await createAsyncComponent(
      import("./ui/todos/index.js")
    );
    this.todosSection.replaceChildren(todosSection);
  }
}

HomePage.setup();

export default HomePage;
