// Buddy Pond - Window.js - Marak Squires 2023
// A simple window class for creating draggable, resizable windows
// Remark: WindowManager interface is optional and will be stubbed out if not provided

import maximize from "./lib/maximize.js";
import minimize from "./lib/minimize.js";
import open from "./lib/open.js";
import close from "./lib/close.js";
import createWindow from "./lib/createWindow.js";

let idCounter = 0;

class Window {
    constructor(options = {}, windowManager) {
        const {
            title = "Window", // Title of the window
            width = '400px', // Default width
            height = '300px', // Default height
            app = 'default', // default app
            type = 'singleton', // Default type ( intended to not have siblings )
            context = 'default', // Default context
            content = '', // Default content
            iframeContent = false,
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
        } = options;

        this.windowManager = windowManager;

        // ensure that no other window has the same id
        // we could check the windowManger.windows array for this
        // we will check the document ( in case another system has created a window )
        let existingWindow = document.getElementById(id);
        if (existingWindow) {
            console.log('Window with id already exists', id);
            return existingWindow;
        }

        this.title = title;
        this.icon = icon;
        this.width = width;
        this.height = height;

        if (app !== 'default') {
            this.app = app;
        } else {
            this.app = id;
        }


        this.type = type;
        this.x = x;
        this.y = y;
        this.z = 99;
        this.context = context;
        this.parent = parent;
        this.id = id;
        this.isMaximized = false;
        this.isMinimized = false;
        this.container = null;
        this.content = null;
        this.iframeContent = iframeContent;
        this.contentValue = content;
        this.isActive = false;
        this.className = className;
        this.resizeable = resizeable;
        this.preventOverlap = preventOverlap;
        this.canBeBackground = canBeBackground;


        // if position is set, override the x and y values
        if (position === 'center') {
            this.x = (window.innerWidth - parseInt(this.width)) / 2;
            this.y = (window.innerHeight - parseInt(this.height)) / 2;
        }


        windowManager = windowManager || {
            windows: [],
            saveWindowsState: () => { },
            removeWindow: () => { },

        };

        this.bp = options.bp;

        this.onFocus = onFocus;
        this.onClose = onClose;
        this.onOpen = onOpen;
        this.onLoad = onLoad;
        this.onMessage = onMessage;

        this.startDrag = this.startDrag.bind(this);
        this.drag = this.drag.bind(this);
        this.stopDrag = this.stopDrag.bind(this);


        this.createWindow();
        this.open();

        return this;
    }

    initContentArea() {
        if (typeof this.iframeContent === 'boolean' && this.iframeContent) {
            this.content = document.createElement("iframe");
            this.content.classList.add("bp-window-content");
            document.body.appendChild(this.content);
            this.content.src = 'about:blank';
            this.content.onload = () => {
                let iframeDoc = this.content.contentDocument || this.content.contentWindow.document;
                iframeDoc.open();
                iframeDoc.write(this.contentValue);
                iframeDoc.close();
                this.setupMessageHandling();
            };
        } else if (typeof this.iframeContent === 'string' && this.iframeContent.length) {
            this.content = document.createElement("div");
            this.content.classList.add("bp-window-content");

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
                this.iframe.onload = () => this.setupMessageHandling();
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
            this.content.classList.add("bp-window-content");
            if (typeof this.contentValue === 'string') {
                this.content.innerHTML = this.contentValue;
            } else {
                this.content.appendChild(this.contentValue);
            }
        }
    }

    // TODO: migrate away from iframe messages and use BroadcastChannel instead
    setupMessageHandling() {
        // iframe is loaded by now
        this.onLoad(this);
        const iframeWindow = this.iframe.contentWindow;

        // Inject a script into the iframe to listen for the ESC key
        const iframeDoc = this.iframe.contentDocument || this.iframe.contentWindow.document;
        const script = iframeDoc.createElement("script");
        script.type = "text/javascript";
        script.textContent = `
            document.addEventListener('keydown', (event) => {
                if (event.key === 'Escape') {
                    window.parent.postMessage({ event: 'ESC_KEY_PRESSED' }, '*');
                }
            });
        `;
        //alert(script.textContent)
        iframeDoc.body.appendChild(script);

        // Set the message event listener on the iframe's window
        window.addEventListener('message', this.receiveMessage.bind(this), false);
    }


    sendMessage(message) {
        if (this.iframe && this.iframe.contentWindow) {
            this.iframe.contentWindow.postMessage(message, '*'); // Consider specifying an origin here instead of '*'
        }
    }

    receiveMessage(event) {
        // Ensure security by checking the event.origin, if possible
        if (typeof event.data === 'object' && event.data.event) {
            if (event.data.event === 'ESC_KEY_PRESSED') {
                console.log('ESC key pressed inside iframe. Closing window...');
                this.close();
            } else {
                this.handleReceivedMessage(event.data);
            }
        }
    }

    handleReceivedMessage(data) {
        //console.log('Handled Received message:', data, this.onMessage);
        if (this.onMessage) {
            this.onMessage(data);
        }
    }


    move(x, y) {
        this.x = x;
        this.y = y;
        this.container.style.top = `${this.y}px`;
        this.container.style.left = `${this.x}px`;
        this.windowManager.saveWindowsState();
    }

    serialize() {

        // we need an xpath selector for this.parent
        let parentXpath = getXPathForElement(this.parent);
        // console.log('parentXpath', parentXpath);
        return {
            title: this.title,
            width: this.width,
            height: this.height,
            type: this.type,
            app: this.app,
            x: this.x,
            y: this.y,
            z: this.z,
            context: this.context,
            parent: parentXpath,
            id: this.id,
            onClose: this.onClose,
            onOpen: this.onOpen,
            className: this.className,
            resizeable: this.resizeable,
            canBeBackground: this.canBeBackground
        };
    }

    hydrate(data) {
        console.log('hydrate', data);
        this.title = data.title;
        this.width = data.width;
        this.height = data.height;
        this.app = data.app;
        this.type = data.type;
        this.x = data.x;
        this.y = data.y;
        this.z = Number(data.z);
        this.context = data.context;
        // TODO: some of these are constructor...maybe all?
        // this.parent = document.querySelector(data.parent);
        this.id = data.id;
        this.onClose = data.onClose;
        this.onOpen = data.onOpen;
        this.onMessage = data.onMessage;
        this.className = data.className;
        this.resizeable = data.resizeable;
        this.canBeBackground = data.canBeBackground;

        this.updateWindow();
    }

    updateWindow() {
        this.container.style.width = `${this.width}px`;
        this.container.style.height = `${this.height}px`;
        this.container.style.top = `${this.y}px`;
        this.container.style.left = `${this.x}px`;
        this.container.style.zIndex = this.z;
        // console.log('updateWindow', this);
    }

    setDepth(depth) {
        this.z = depth;
        this.container.style.zIndex = depth;
        // console.log('container depth was set to', this.id, depth);
        this.windowManager.saveWindowsState();
    }

    setAsBackground() {
        console.log('setAsBackground', this.windowManager.windows);
        if (!this.canBeBackground) {
            console.log('This window cannot be set as background. Try setting canBeBackground:true in the Window declaration');
            return;
        }
        // check other api.ui.windowManager.windows and restore them if isBackground is true
        this.windowManager.windows.forEach((window) => {
            if (window.isBackground) {
                window.restoreWindowFromBackground();
            }
        });

        this.container.style.zIndex = -1;

        // make full window size
        this.container.style.width = "100%";
        this.container.style.height = "100%";

        // set top and left to 0
        this.container.style.top = "0";
        this.container.style.left = "0";

        this.isBackground = true;
        this.isActive = false;
    }

    restoreWindowFromBackground() {

        this.isBackground = false;

        // reset the z-index
        this.container.style.zIndex = 11000;

        // reset the window size
        this.container.style.width = `${this.width}`;
        this.container.style.height = `${this.height}`;

        // put window back to original position
        this.container.style.top = `${this.y}px`;
        this.container.style.left = `${this.x}px`;

        // get the menubar-restore-background-window element and add disabled class
        let el = document.getElementById('menubar-restore-background-window');
        if (el) {
            el.classList.add('disabled');
        }

    }

    startDrag(e) {
        this.isDragging = true;
        this.titleBar.style.cursor = "grabbing";

        // Disable pointer events on iframe
        const iframes = this.container.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            iframe.style.pointerEvents = 'none';
        });

        // Get coordinates from mouse or touch event
        const { clientX, clientY } = this.getEventCoordinates(e);
        this.offsetX = clientX - this.container.offsetLeft;
        this.offsetY = clientY - this.container.offsetTop;

        // Add event listeners for both mouse and touch events
        document.addEventListener('mousemove', this.drag);
        document.addEventListener('touchmove', this.drag, { passive: false });
        document.addEventListener('mouseup', this.stopDrag);
        document.addEventListener('touchend', this.stopDrag);
    }

    drag(e) {
        if (!this.isDragging) return;

        // Prevent default behavior for touchmove to avoid scrolling
        e.preventDefault();

        // Get coordinates from mouse or touch event
        const { clientX, clientY } = this.getEventCoordinates(e);

        // Update container position
        // Ensure window does not drag off the screen
        let menuBarHeight = 42;
        let bottomLimit = window.innerHeight - 52; // 50px from bottom
        if (clientY > menuBarHeight && clientY < bottomLimit) {
            this.container.style.top = `${clientY - this.offsetY}px`;
        }
        let leftLimit = 52; // 0px from left
        let rightLimit = window.innerWidth - 52; // 0px from right
        if (clientX > leftLimit && clientX < rightLimit) {
            this.container.style.left = `${clientX - this.offsetX}px`;
        }
    }

    stopDrag() {
        this.isDragging = false;
        this.titleBar.style.cursor = "grab";

        // Restore pointer events on iframe
        const iframes = this.container.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            iframe.style.pointerEvents = 'auto';
        });

        // Remove event listeners
        document.removeEventListener('mousemove', this.drag);
        document.removeEventListener('touchmove', this.drag);
        document.removeEventListener('mouseup', this.stopDrag);
        document.removeEventListener('touchend', this.stopDrag);

        // Save window state
        this.x = this.container.offsetLeft;
        this.y = this.container.offsetTop;
        this.z = Number(this.container.style.zIndex);
        if (this.windowManager) {
            this.windowManager.saveWindowsState();
        } else {
            console.warn('windowManager is not defined');
        }
    }

    getEventCoordinates(e) {
        let clientX, clientY;
        if (e.type.startsWith('touch')) {
            // Use the first touch point for dragging
            const touch = e.touches[0] || e.changedTouches[0];
            clientX = touch.clientX;
            clientY = touch.clientY;
        } else {
            // Mouse event
            clientX = e.clientX;
            clientY = e.clientY;
        }
        return { clientX, clientY };
    }

    // Restore the window
    restore() {
        // console.log('restore', this)
        // Restore the window's content and original size

        if (this.bp.isMobile()) {
            this.windowManager.minimizeAllWindows(true);
        }

        if (window.discordView) {
            // this.windowManager.minimizeAllWindows(true);
        }

        this.container.style.display = "flex";

        //this.container.style.top = this.y + 'px';
        //this.container.style.left = this.x + 'px';

        // Mark as not minimized
        this.isMinimized = false;
        // TODO: save the window state

    }

    focus(propigate = true) {
        // console.log('on focus called from Window.js')
        if (propigate) {
            this.windowManager.focusWindow(this);
        }

        // check if window is minimized, if so, restore it
        if (this.isMinimized) {
            this.restore();
        }

        this.onFocus(this);

        let appData = this.bp.apps.desktop.appList[this.id];
        let pushStateId = this.id;
        if (appData && appData.alias) {
            // get the first entry in the alias array
            let alias = appData.alias[0];
            pushStateId = alias; // use the id if it exists, otherwise use the alias string
        }
        // history.pushState({ appId: pushStateId }, this.title, `/app/${pushStateId}`);
        DelayedPushState.push({ appId: pushStateId }, this.title, `/app/${pushStateId}`);

    }


    addResizeHandles() {
        const resizeHandle = document.createElement("div");
        resizeHandle.classList.add("resize-handle");
        this.container.appendChild(resizeHandle);
        resizeHandle.addEventListener("mousedown", (e) => this.startResize(e), { passive: false });
        resizeHandle.addEventListener("touchstart", (e) => {
            e.preventDefault(); // Prevent default touch behavior
            this.startResize(e.touches[0]);
        }, { passive: false });
    }

    setSize(width, height) {
        this.width = width;
        this.height = height;
        this.container.style.width = `${this.width}`;
        this.container.style.height = `${this.height}`;
        // save the window state
        this.windowManager.saveWindowsState();
    }

    startResize(e) {
        const container = this.container;
        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = container.offsetWidth;
        const startHeight = container.offsetHeight;

        const onMove = (moveEvent) => {
            const clientX = moveEvent.clientX || moveEvent.touches[0].clientX;
            const clientY = moveEvent.clientY || moveEvent.touches[0].clientY;
            const newWidth = startWidth + (clientX - startX);
            const newHeight = startHeight + (clientY - startY);

            // Apply new dimensions, respecting min/max constraints
            container.style.width = `${Math.max(100, newWidth)}px`; // Example min-width
            container.style.height = `${Math.max(100, newHeight)}px`; // Example min-height
        };

        const onUp = () => {
            document.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseup", onUp);
            document.removeEventListener("touchmove", onMove);
            document.removeEventListener("touchend", onUp);
        };

        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", onUp);
        document.addEventListener("touchmove", onMove, { passive: false });
        document.addEventListener("touchend", onUp);
    }

    resize(e) {
        if (!this.isResizing) return;
        const newWidth = this.startWidth + (e.clientX - this.startX);
        const newHeight = this.startHeight + (e.clientY - this.startY);

        this.container.style.width = `${newWidth}px`;
        this.container.style.height = `${newHeight}px`;

        if (this.onResize) {
            this.onResize(newWidth, newHeight);
        }

    }

    stopResize() {
        this.isResizing = false;
        // TODO: save the window state

    }

    setTitle(title) {
        this.title = title;
        this.titleBarSpan.textContent = title;
        // save the window state
        this.windowManager.saveWindowsState();
    }

    setContent(content) {
        this.contentValue = content;
        this.content.innerHTML = content;
        // save the window state
        this.windowManager.saveWindowsState();
    }
}

export default Window;


function getXPathForElement(element) {
    const fullPath = (el) => {
        let names = [];
        while (el.parentNode) {
            if (el.id) { // If the element has an ID, use it as a unique identifier
                names.unshift('#' + el.id);
                break;
            } else {
                let e = el, sibling, count = 1;
                while (sibling = e.previousSibling) {
                    if (sibling.nodeType === 1 && sibling.tagName === e.tagName) { count++; }
                    e = sibling;
                }
                const tagName = el.tagName.toLowerCase();
                const nth = count > 1 ? `:nth-of-type(${count})` : '';
                names.unshift(`${tagName}${nth}`);
                el = el.parentNode;
            }
        }
        return names.length ? names.join(' > ') : null;
    };
    return fullPath(element);
}

Window.prototype.maximize = maximize;
Window.prototype.minimize = minimize;
Window.prototype.open = open;
Window.prototype.close = close;
Window.prototype.createWindow = createWindow;