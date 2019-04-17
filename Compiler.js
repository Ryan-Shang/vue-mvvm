class Compiler {
  constructor (node, vm) {
    this.el = vm.$el;
    this.vm = vm;
    if (this.isElementNode(node)) {
      // 把DOM节点存到内存中
      let fragment = document.createDocumentFragment();
      let tempNode;
      while (tempNode = node.firstChild) {
        fragment.appendChild(tempNode);
      }
      // 编译
      this.compile(fragment);
      // 恢复到文档中
      this.el.appendChild(fragment);
    }
  }
  isElementNode = (node) => node.nodeType === 1;
  isDirective = (str) => str.startsWith('v-');
  updater = (type, node, value) => {
    switch (type) {
      case 'model':
        node.value = value;
        break;
      case 'text':
        node.textContent = value;
        break;
      case 'html':
        node.innerHTML = value;
        break;
      default:
    }
  };
  getContentValue = (vm, expr) => {
    return expr.replace(/\{\{(.+)\}\}/g, (...args) => {
      return utils.getValue(vm, args[1]);
    });
  };
  complieDirective = (type, node, data, vm, eventName) => {
    switch (type) {
      case 'model':
        // data => attr的value
        new Watcher(vm, data, (nv) => {
          this.updater(type, node, nv);
        })
        node.addEventListener('input', (e) => {
          let value = e.target.value;
          utils.setValue(vm, data, value);
        })
        let value = utils.getValue(vm, data);
        this.updater(type, node, value);
        break;
      case 'text':
        // data => {{}}中间的数据
        let content = data.replace(/\{\{(.+)\}\}/g, (...args) => {
          console.log(args)
          new Watcher(vm, args[1], (nv) => {
            this.updater(type, node, this.getContentValue(vm, data));
          })
          return utils.getValue(vm, args[1]);
        })
        this.updater(type, node, content);
        break;
      case 'html':
        // data => attr的value
        new Watcher(vm, data, (nv) => {
          this.updater(type, node, nv);
        })
        let html = utils.getValue(vm, data);
        this.updater(type, node, html);
        break;
      case 'on':
        // data => attr的value
        node.addEventListener(eventName, (e) => {
          vm[data].call(vm, e);
        })
      default:
    }
  };
  complieElementNode = (node) => {
    let attrs = node.attributes;
    [...attrs].forEach(attr => {
      let {name, value} = attr;
      if (this.isDirective(name)) {
        let [, directive] = name.split('-');
        let [directiveName, eventName] = directive.split(':');
        this.complieDirective(directiveName, node, value, this.vm, eventName);
      }
    })
  };
  compileTextNode = (node) => {
    let content = node.textContent;
    if (/\{\{(.+?)\}\}/.test(content)) {
      this.complieDirective('text', node, content, this.vm);
    }
  };
  compile = (node) => {
    let childNodes = node.childNodes;
    [...childNodes].forEach(child => {
      if (this.isElementNode(child)) {
        this.complieElementNode(child);
        this.compile(child);
      } else {
        this.compileTextNode(child);
      }
    })
  };
}