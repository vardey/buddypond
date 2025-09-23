export default class GameDoom {
  // constructor is required, it is called when the app is loaded
  constructor(bp, options = {}) {
    this.bp = bp;
    this.options = options;
    return this;
  }

  // init is required, it is called when the app is opened or initialized
  async init() {
    this.html = await this.bp.load('/v5/apps/based/game-doom/game-doom.html');
    await this.bp.load('/v5/apps/based/game-doom/game-doom.css');
    return 'loaded GameDoom';
  }

  async open() {
    if (!this.win) {
      this.win = await this.bp.window(this.window());
    }
    return this.win;
  }

  window() {
    return {
      id: 'game-doom',
      title: 'Doom',
      icon: 'desktop/assets/images/icons/icon_game-doom_64.webp',
      position: 'center',
      parent: $('#desktop')[0],
      width: 850,
      height: 600,
      // content: this.html,
      iframeContent: '/v5/apps/based/game-doom/vendor/doom.html',
      resizable: true,
      closable: true,
      onClose: () => {
        this.win = null;
      }
    }
  }
}
