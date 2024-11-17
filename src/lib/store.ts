export class Store {
  static set = (key: string, value: string) => {
    if (value === null || value === undefined) {
      this.remove(key);
      return;
    }
    localStorage.setItem(key, value);
  };

  static get = (key: string) => {
    return localStorage.getItem(key);
  };

  static remove = (key: string) => {
    return localStorage.removeItem(key);
  };

  static getWithDefault = (key: string, defaultVal: string): string => {
    const res = this.get(key);
    if (res === null || res === undefined) {
      this.set(key, defaultVal);
      return defaultVal;
    }
    return res;
  };

  static setObj = (key: string, obj: Object) => {
    this.set(key, JSON.stringify(obj));
  };

  static getObj = (key: string) => {
    const res = this.get(key);
    if (res === null || res === undefined) {
      return null;
    }
    return JSON.parse(res);
  };
}
