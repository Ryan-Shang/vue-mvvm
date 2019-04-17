let utils = {
  trim (str) {
    return str.replace(/\s/g, '')
  },
  getValue (vm, expr) {
    expr = this.trim(expr);
    return expr.split('.').reduce((data, cur)=>{
      return data[cur];
    }, vm.$data);
  },
  setValue (vm, expr, value) {
    expr = this.trim(expr);
    expr.split('.').reduce((data, cur, index, arr)=>{
      if (index === arr.length - 1) {
        return data[cur] = value;
      }
      return data[cur];
    }, vm.$data);
  }
}

class Vue {
  constructor (options) {
    this.$el = document.querySelector(options.el);
    this.$data = options.data;
    this.$methods = options.methods;
    this.$computed = options.computed;
    if (this.$el) {
      new Observer(this.$data);
      this.handleComputed (this.$computed);
      this.handleMethods(this.$methods);
      this.handleProxy(this.$data);
      new Compiler(this.$el, this);
    }
  }
  handleProxy = (data) => {
    for (let key in data) {
      Object.defineProperty(this, key, {
        get () {
          return data[key];
        },
        set (nv) {
          data[key] = nv;
        }
      })
    }
  }
  handleComputed = (computed) => {
    for (let key in computed) {
      Object.defineProperty(this.$data, key, {
        get: () => {
          return computed[key].call(this);
        }
      })
    }
  }
  handleMethods = (methods) => {
    for (let key in methods) {
      Object.defineProperty(this, key, {
        get: () => {
          return methods[key];
        }
      })
    }
  }
}