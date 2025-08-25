import appList from "./appList.js";

export default class Apps {
  constructor(bp, options = {}) {
    this.bp = bp;
    return this;
  }
  async init() {
    this.bp.apps.list = appList;
    return 'loaded Apps';
  }
  async open(options = {}) {}
}