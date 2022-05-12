import { WebComponent, on } from "https://cdn.jsdelivr.net/gh/oakfang/bean@cocoa/base.js";
import state from "/static/js/state.js";
import { UPDATE_TODO, DELETE_TODO, CREATE_TODO } from "./consts.js";
import { getTodos, putTodo, deleteTodo, postTodo } from "./api.js";
import "./adder.js";
import "./item.js";

await state.update(async (current) => {
  current.todos = await getTodos();
});

export default (class TodosSection extends WebComponent {
  static tagName = "todos-section";
  static html = `
    <style>
        todos-adder {
            display: block;
            margin-bottom: 15px;
        }
        div {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 5px;
        }
    </style>
    <todos-adder></todos-adder>
    <div role="list">
    </div>
  `;

  static handles = {
    items: (dom) => dom.querySelector("div"),
    adder: (dom) => dom.querySelector("todos-adder"),
  };

  async [on(CREATE_TODO)](event) {
    const todo = event.detail;
    state.tx(
      (current) => {
        current.todos.unshift(todo);
      },
      () => postTodo(todo)
    );
  }

  async [on(UPDATE_TODO)](event) {
    const todo = event.detail;

    state.tx(
      (current) => {
        const idx = current.todos.findIndex(({ id }) => todo.id === id);
        if (idx > -1) {
          current.todos[idx] = todo;
        }
      },
      () => putTodo(todo)
    );
  }

  async [on(DELETE_TODO)](event) {
    const { detail: todo } = event;
    state.tx(
      (current) => {
        const idx = current.todos.findIndex(({ id }) => todo.id === id);
        if (idx > -1) {
          current.todos.splice(idx, 1);
        }
      },
      () => deleteTodo(todo)
    );
  }

  createTodoElement(todo) {
    const todoItem = document.createElement("todo-item");
    todoItem.todo = todo;
    return todoItem;
  }

  syncChanges(todos) {
    this.items.replaceChildren(
      ...todos.map((todo) => this.createTodoElement(todo))
    );
  }

  async forkStateUpdates() {
    for await (let { todos } of state) {
      if (!this.isConnected) return;
      this.syncChanges(todos);
    }
  }

  onBeforeMount() {
    this.forkStateUpdates();
  }
}.setup());
