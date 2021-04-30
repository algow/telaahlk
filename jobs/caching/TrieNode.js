class Node {
  constructor(value) {
    this.value = value;
    this.children = [];
    this.isTail = false;
    this.filters = [];
  }
}

module.exports = Node;