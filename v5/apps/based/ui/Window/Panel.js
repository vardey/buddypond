class Panel {
  constructor(options = {}, windowManager) {
    const {
      id = 'panel',
      title = 'Panel',
      icon = null,
      position = 'bottom', // 'top', 'left', 'right', 'bottom'
      panel = 'body',
      width = 300,
      height = 200,
      iframeContent = false,
      content = '',
      resizable = false,
      closable = false,
      minimizable = false,
      maximizable = false,
      focusable = false,
      maximized = false,
      minimized = false,
      onClose = null,
      onMinimize = null,
      onMaximize = null,
      onFocus = null,
      onBlur = null
    } = options;
    this.windowManager = windowManager;
    this.bp = this.windowManager.bp;
    this.id = id;
    this.title = title;
    // create new DOM element for this.container
    this.container = document.createElement('div');
    this.content = null;
    this.iframeContent = iframeContent;
    this.contentValue = content;
    this.parent = panel;
    this.width = '100%';
    this.height = '100%';


    this.initContentArea();

    // append the content to the container
    this.container.appendChild(this.content);
    this.container.classList.add('bp-panel');
    this.container.style.overflow = 'hidden';
    // alert(this.width)
    this.container.style.width = `${this.width}`;
    this.container.style.height = `${this.height}`;

    this.content.style.width = '100%';
    this.content.style.height = '100%';
    // append the container to the parent
    $(this.parent).append(this.container);


  }  // methods for Panel can be added here

}


Panel.prototype.initContentArea = function () {
  if (typeof this.iframeContent === 'boolean' && this.iframeContent) {
    this.content = document.createElement("iframe");
    this.content.classList.add("bp-panel-content");
    document.body.appendChild(this.content);
    this.content.src = 'about:blank';
    this.content.onload = () => {
      let iframeDoc = this.content.contentDocument || this.content.contentWindow.document;
      iframeDoc.open();
      iframeDoc.write(this.contentValue);
      iframeDoc.close();
      // this.setupMessageHandling();
    };
  } else if (typeof this.iframeContent === 'string' && this.iframeContent.length) {
    this.content = document.createElement("div");
    this.content.classList.add("bp-panel-content");

    this.iframe = document.createElement("iframe");

    this.content.appendChild(this.iframe);
    // by default add allow attributes to the iframe
    this.iframe.setAttribute("allow", "autoplay; encrypted-media; fullscreen; clipboard-write; accelerometer; gyroscope; web-share");

    // if this.iframeContent starts with a '/' it's a local iframe
    // and if window.discordMode is true, we need to prepend /.proxy/
    if (this.iframeContent.startsWith('/')) {
      if (window.discordMode) {
        this.iframeContent = `/.proxy${this.iframeContent}`;
      }
    }

    this.iframe.src = this.iframeContent;

    // Remark: This is legacy settings for iframe message handling bootstrapping
    // In more modern applications, we use broadcast channels or other methods
    // It's important we don't attempt to setup message handling for iframes that are not from the same origin
    let currentOrigin = window.location.origin;
    let iframeOrigin = this.iframe.src;

    // check if currentOrigin can be found in iframeOrigin
    if (iframeOrigin.indexOf(currentOrigin) !== -1) {
      // this.iframe.onload = () => this.setupMessageHandling();
    } else {

      // hide the iframe
      this.iframe.style.display = 'none';
      this.iframe.onload = () => {
        // remove loading image
        loaderHolder.remove();
        // show the iframe
        this.iframe.style.display = 'block';
      }

      // add the loaderHolder
      let loaderHolder = document.createElement("div");
      loaderHolder.id = "loaderHolder";
      loaderHolder.innerHTML = `
                <div id="loader"></div>
                <p class="loaderText">Loading... ${this.id || this.title || this.label || ''}</p>
            `;
      this.content.appendChild(loaderHolder);

      // console.log('not setting up legacy iframe message handling, as the iframe origin does not match current origin');
    }
  } else {
    this.content = document.createElement("div");
    this.content.classList.add("bp-panel-content");
    console.log('content', this.content);
    console.log('contentValue', this.contentValue);
    if (typeof this.contentValue === 'string') {
      this.content.innerHTML = this.contentValue;
    } else {
      this.content.appendChild(this.contentValue);
    }
  }
    this.content.style.padding = '0px !important';
  this.content.style.margin = '0px !important';

}

Panel.prototype.setContent = function (content) {
  this.contentValue = content;
  this.content.innerHTML = content;
  // save the window state
  this.windowManager.saveWindowsState();
}


Panel.prototype.serialize = function () {
  return {
    id: this.id,
    title: this.title,
    icon: this.icon,
    position: this.position,
    width: this.width,
    height: this.height,
    resizable: this.resizable,
    closable: this.closable,
    minimizable: this.minimizable,
    maximizable: this.maximizable,
    focusable: this.focusable,
    maximized: this.maximized,
    minimized: this.minimized
  };
};

Panel.prototype.setDepth = function (zIndex) {
  //this.container.style.zIndex = zIndex;
  //this.zIndex = zIndex;
};

Panel.prototype.minimize = function (zIndex) {
};

Panel.prototype.restore = function (zIndex) {
};

Panel.prototype.focus = function () {
  if (this.focusable) {
    this.container.classList.add('focused');
    if (this.onFocus) {
      this.onFocus(this);
    }
    // scroll the document to the container
    this.bp.emit('window::focus', this);
  }
  // TODO: we may need better logic for auto-scrolling to panels on open/focus
  // Remark: Might be better to make this an option, or to modify bp.open() to accept a scrollIntoView option
  // Prior behavior was catering to Windows, not Panels
  this.container.scrollIntoView({ behavior: 'smooth', block: 'end' });
};

Panel.prototype.close = function () {
  if (this.onClose) {
    this.onClose(this);
  }
  this.container.remove();
  this.bp.emit('window::close', this);
  // remove the window from the window manager
  this.windowManager.removeWindow(this.id);
  // save the window state
  this.windowManager.saveWindowsState();
};
export default Panel;
