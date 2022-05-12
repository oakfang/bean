import { ValueStream } from "https://cdn.jsdelivr.net/gh/oakfang/bean/vstream.js";

const stateManager = new ValueStream({
  todos: null,
});

export default stateManager;
