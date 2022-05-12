import { WebComponent, on } from "https://cdn.jsdelivr.net/gh/oakfang/bean/base.js";
import { CREATE_TODO } from "./consts.js";

export default (class extends WebComponent {
  static tagName = "todos-adder";
  static html = `
          <style>
              form {
                  display: flex;
              }
              input {
                  flex: 1;
              }
          </style>
          <form>
              <input type="text" />
              <button>Add</button>
          </form>
      `;
  static handles = {
    form: (dom) => dom.querySelector("form"),
    addButton: (dom) => dom.querySelector("button"),
    textbox: (dom) => dom.querySelector("input"),
  };
  get isDisabled() {
    return this.addButton.disabled;
  }
  set isDisabled(value) {
    this.addButton.disabled = value;
    return true;
  }
  clear() {
    this.form.reset();
  }
  submit() {
    if (this.isDisabled) {
      return;
    }
    this.emit(CREATE_TODO, {
      title: this.textbox.value,
      completed: false,
    });
    this.clear();
  }
  [on('input')]() {
    this.isDisabled = !this.textbox.value;
  }
  [on('submit^')](e) {
    e.preventDefault();
    this.submit();
  }
  onBeforeMount() {
    this.isDisabled = !this.textbox.value;
  }
}.setup());
