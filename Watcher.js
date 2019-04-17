class Watcher {
  constructor(vm, expr, cb) {
    this.vm = vm;
    this.expr = expr;
    this.cb = cb;
    this.ov = this.get(vm, expr);
  }
  get = () => {
    Dep.target = this;
    let val = utils.getValue(this.vm, this.expr);
    Dep.target = null;
    return val;
  }
  update = () => {
    let nv = utils.getValue(this.vm, this.expr);
    if (nv !== this.ov) {
      this.cb && this.cb(nv);
    }
  }
}