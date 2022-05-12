import { WebComponent, prop, on } from "https://cdn.jsdelivr.net/gh/oakfang/bean@cocoa/base.js";
import { UPDATE_TODO, DELETE_TODO } from "./consts.js";

export default (class extends WebComponent {
  static tagName = "todo-item";
  static defaultAttributes = {
    role: "listitem",
  };
  static html = `
      <style>
          p {
              margin: 0;
              padding: 5px 10px;
              border-radius: 5px;
              background-color: var(--fill, purple);
              color: var(--text, white);
              cursor: pointer;
          }
          p[aria-checked=true] {
              opacity: 0.5;
          }
      </style>
      <p>
      </p>
    `;

  static handles = {
    root: (dom) => dom.querySelector("p"),
  };

  get todo() {
    return JSON.parse(this.getAttribute("todo"));
  }

  set todo(todo) {
    this.setAttribute("todo", JSON.stringify(todo));
    return true;
  }

  updateTodo() {
    const { todo } = this;
    const updated = { ...todo, completed: !todo.completed };
    this.emit(UPDATE_TODO, updated);
  }

  deleteTodo() {
    this.emit(DELETE_TODO, this.todo);
  }

  [on("click")](event) {
    const shouldDelete = event.ctrlKey || event.metaKey;
    if (shouldDelete) {
      this.deleteTodo();
    } else {
      this.updateTodo();
    }
  }

  [prop("todo")](_, [todoRaw = "{}"]) {
    const { root } = this;
    const todo = JSON.parse(todoRaw);
    root.textContent = todo.title;
    root.role = "checkbox";
    root.ariaChecked = todo.completed;
  }
}.setup());
