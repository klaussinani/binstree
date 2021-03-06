'use strict';
const Node = require('./node');

class Tree {
  constructor() {
    this._root = null;
  }

  get root() {
    return this._root;
  }

  _insert(node, target) {
    while (target) {
      if (node.key === target.key) {
        return;
      }

      if (node.key < target.key) {
        if (!target.left) {
          target.left = node;
          return;
        }

        target = target.left;
      } else {
        if (!target.right) {
          target.right = node;
          return;
        }

        target = target.right;
      }
    }
  }

  _min(node) {
    let min = node;

    if (min) {
      while (min.left) {
        min = min.left;
      }
    }

    return min;
  }

  _remove(key, node) {
    if (key < node.key) {
      node.left = this._remove(key, node.left);
      return node;
    }

    if (key > node.key) {
      node.right = this._remove(key, node.right);
      return node;
    }

    if (node.isLeaf()) {
      return null;
    }

    if (!node.left) {
      return node.right;
    }

    if (!node.right) {
      return node.left;
    }

    const successor = this._min(node.right);
    node._key = successor.key;
    node.value = successor.value;
    node.right = this._remove(successor.key, node.right);
    return node;
  }

  clear() {
    this._root = null;
    return this;
  }

  height() {
    const {_root} = this;

    if (_root) {
      return _root.height();
    }

    return -1;
  }

  fullNodes() {
    const nodes = [];

    this.inOrder(node => {
      if (node.isFull()) {
        nodes.push(node);
      }
    });

    return nodes;
  }

  includes(key) {
    let {_root: current} = this;

    while (current) {
      if (key === current.key) {
        return true;
      }

      current = key < current.key ? current.left : current.right;
    }

    return false;
  }

  inOrder(fn) {
    const stack = [];
    let {_root: current} = this;

    while (current || stack.length > 0) {
      if (current) {
        stack.push(current);
        current = current.left;
      } else {
        current = stack.pop();
        fn(current);
        current = current.right;
      }
    }

    return this;
  }

  insert(key, value) {
    const {_root} = this;
    const node = new Node(key, value);

    if (_root) {
      this._insert(node, _root);
    } else {
      this._root = node;
    }

    return this;
  }

  internalNodes() {
    const nodes = [];

    this.inOrder(node => {
      if (node.isInternal()) {
        nodes.push(node);
      }
    });

    return nodes;
  }

  isBalanced() {
    let {_root: current} = this;

    if (current) {
      let height = 0;
      const queue = [current];
      let [minHeight, maxHeight] = [Infinity, -Infinity];

      while (queue.length > 0) {
        let nodes = queue.length;

        while (nodes > 0) {
          current = queue.shift();

          if (current.isLeaf()) {
            minHeight = minHeight > height ? height : minHeight;
            maxHeight = maxHeight < height ? height : maxHeight;
          } else {
            queue.push(...current.children);
          }

          nodes--;
        }

        if (maxHeight - minHeight > 1) {
          return false;
        }

        height++;
      }
    }

    return true;
  }

  isComplete() {
    let {_root: current} = this;

    if (current) {
      const queue = [current];
      let sawNonFull = false;

      while (queue.length > 0) {
        current = queue.shift();

        if (current.isRightPartial()) {
          return false;
        }

        if (current.isLeaf()) {
          sawNonFull = true;
        } else {
          if (sawNonFull) {
            return false;
          }

          const {children} = current;
          sawNonFull = children.length < 2;
          queue.push(...children);
        }
      }
    }

    return true;
  }

  isEmpty() {
    return !this.root;
  }

  isFull() {
    let {_root: current} = this;

    if (current) {
      const queue = [current];

      while (queue.length > 0) {
        current = queue.shift();

        if (current.degree === 1) {
          return false;
        }

        if (current.isFull()) {
          queue.push(current.left, current.right);
        }
      }
    }

    return true;
  }

  isPerfect() {
    let {_root: current} = this;

    if (!current) {
      return true;
    }

    let leafDepth;
    let sawLeaf = false;
    let currentDepth = -1;
    const queue = [current];

    while (queue.length > 0) {
      currentDepth += 1;
      let {length: nodes} = queue;

      while (nodes > 0) {
        current = queue.shift();
        nodes -= 1;

        if (current.isPartial()) {
          return false;
        }

        if (current.isLeaf()) {
          if (sawLeaf && leafDepth !== currentDepth) {
            return false;
          }

          sawLeaf = true;
          leafDepth = currentDepth;
        } else {
          if (sawLeaf) {
            return false;
          }

          queue.push(...current.children);
        }
      }
    }

    return true;
  }

  leafNodes() {
    const nodes = [];

    this.inOrder(node => {
      if (node.isLeaf()) {
        nodes.push(node);
      }
    });

    return nodes;
  }

  levelOrder(fn) {
    let {_root: current} = this;

    if (current) {
      const queue = [];
      queue.push(current);

      while (queue.length > 0) {
        current = queue.shift();
        fn(current);
        queue.push(...current.children);
      }
    }

    return this;
  }

  max() {
    let {_root: max} = this;

    if (max) {
      while (max.right) {
        max = max.right;
      }
    }

    return max;
  }

  min() {
    return this._min(this._root);
  }

  outOrder(fn) {
    const stack = [];
    let {_root: current} = this;

    while (current || stack.length > 0) {
      if (current) {
        stack.push(current);
        current = current.right;
      } else {
        current = stack.pop();
        fn(current);
        current = current.left;
      }
    }

    return this;
  }

  partialNodes() {
    const nodes = [];

    this.inOrder(node => {
      if (node.isPartial()) {
        nodes.push(node);
      }
    });

    return nodes;
  }

  postOrder(fn) {
    let last = null;
    const stack = [];
    let {_root: current} = this;

    while (current || stack.length > 0) {
      if (current) {
        stack.push(current);
        current = current.left;
      } else {
        const recent = stack[stack.length - 1];

        if (recent.right && recent.right !== last) {
          current = recent.right;
        } else {
          fn(recent);
          last = stack.pop();
        }
      }
    }

    return this;
  }

  preOrder(fn) {
    let {_root: current} = this;

    if (current) {
      const stack = [current];

      while (stack.length > 0) {
        current = stack.pop();
        fn(current);

        if (current.right) {
          stack.push(current.right);
        }

        if (current.left) {
          stack.push(current.left);
        }
      }
    }

    return this;
  }

  remove(key) {
    const {_root} = this;

    if (_root) {
      this._root = this._remove(key, _root);
    }

    return this;
  }

  search(key) {
    let {_root: current} = this;

    while (current) {
      if (key === current.key) {
        return current;
      }

      current = key < current.key ? current.left : current.right;
    }

    return current;
  }

  size() {
    let size = 0;
    this.inOrder(() => size++);
    return size;
  }

  toArray() {
    const array = [];
    this.inOrder(node => array.push(node));
    return array;
  }

  toPairs() {
    const array = [];
    this.inOrder(node => array.push(node.toPair()));
    return array;
  }
}

module.exports = Tree;
