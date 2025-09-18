export default class HelloWorld {
  // constructor is required, it is called when the app is loaded
  constructor(bp, options = {}) {
    this.bp = bp;
    this.options = options;
    return this;
  }

  // init is required, it is called when the app is opened or initialized
  async init() {
    this.html = await this.bp.load('/v5/apps/based/hello-world/hello-world.html');
    await this.bp.load('/v5/apps/based/hello-world/hello-world.css');

    return 'loaded Hello World';
  }

  async open() {
    if (!this.win) {
      this.win = await this.bp.window(this.window());
    }
    return this.win;
  }

  window() {

    /*

    title = "Window", // Title of the window
    width = '400px', // Default width
    height = '300px', // Default height
    app = 'default', // default app
    type = 'singleton', // Default type ( intended to not have siblings )
    context = 'default', // Default context
    content = '', // Default content
    iframeContent = false, // Can be used to load content in an iframe
    position = null,
    icon = '', // Default icon
    x = 50, // Default x position
    y = 50, // Default y position
    z = 99, // Default z-index
    parent = window.document.body, // Parent element to append to
    id = `window-${idCounter}`, // Unique ID for the panel
    onFocus = () => { }, // Callback when the window is focused
    onClose = () => { }, // Callback when the window is closed
    onOpen = () => { }, // Callback when the window is opened
    onResize = () => { }, // Callback when the window is resized
    onMessage = () => { }, // Callback when the window receives a message
    onLoad = () => { }, // Callback when the window is loaded ( remote content )
    className = '', // Custom classes for styling
    resizeable = true, // Enable resizable feature
    preventOverlap = true, // prevents direct overlap with other windows
    canBeBackground = false // Can be set as background
    */

    return {
      id: 'hello-world',
      title: 'Hello World',
      icon: 'desktop/assets/images/icons/icon_buddy-frog_64.webp',
      position: 'center',
      parent: $('#desktop')[0],
      width: 850,
      height: 600,
      content: this.html,
      resizable: true,
      closable: true,
      onClose: () => {
        this.win = null;
      }
    }
  }
}
