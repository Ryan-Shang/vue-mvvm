class Observer {
  constructor (data) {
    this.observer(data);
  }
  defineReactive = (obj, key, value) => {
    this.observer(value);
    let dep = new Dep();
    Object.defineProperty(obj, key, {
      get: () => {
        Dep.target && dep.addSub(Dep.target);
        return value;
      },
      set: (nv) => {
        if (nv !== value) {
          this.observer(value);
          value = nv;
          dep.notify();
        }
      }
    })
  };
  observer = (data) => {
    if (data && typeof data === 'object') {
      for (let key in data) {
        this.defineReactive(data, key, data[key]);
      }
    }
  };
}