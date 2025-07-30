export default function createWindow() {
    // Create the main window container
    this.container = document.createElement("div");
    this.container.classList.add("window-container");

    // add dataset for app, type, context
    this.container.dataset.app = this.app;
    this.container.dataset.type = this.type;
    this.container.dataset.context = this.context;

    if (this.className) {
        this.container.classList.add(this.className);
    }

    if (!this.resizeable) {
        this.container.classList.add("window-not-resizeable");
    }


    // Helper function to check if two rectangles overlap
    function checkOverlap(x1, y1, w1, h1, x2, y2, w2, h2, buffer = 10) {
        // console.log('checkOverlap', x1, y1, w1, h1, x2, y2, w2, h2, buffer);
        w1 = parseInt(w1);
        h1 = parseInt(h1);
        w2 = parseInt(w2);
        h2 = parseInt(h2);
        return (
            x1 < x2 + w2 + buffer &&
            x1 + w1 + buffer > x2 &&
            y1 < y2 + h2 + buffer &&
            y1 + h1 + buffer > y2
        );
    }

    // Function to adjust position to prevent overlap
    function adjustPosition(newWindow, windows, screenWidth, screenHeight, buffer = 10) {
        let adjustedX = newWindow.x;
        let adjustedY = newWindow.y;

        // Check overlap with other windows
        windows.forEach((win) => {
            if (checkOverlap(adjustedX, adjustedY, newWindow.width, newWindow.height, win.x, win.y, win.width, win.height, buffer)) {
                // console.log('OVERLAP DETECTED');
                adjustedX += buffer; // Move slightly to the right
                // adjustedY += buffer; // Move slightly down
            }
        });

        // Check screen boundaries
        if (adjustedX + newWindow.width + buffer > screenWidth) {
            adjustedX = screenWidth - newWindow.width - buffer; // Move to the left
        }
        if (adjustedY + newWindow.height + buffer > screenHeight) {
            adjustedY = screenHeight - newWindow.height - buffer; // Move up
        }
        if (adjustedX < buffer) {
            adjustedX = buffer; // Move to the right
        }
        if (adjustedY < buffer) {
            adjustedY = buffer; // Move down
        }

        return { x: adjustedX, y: adjustedY };
    }

    // Main Window Creation Logic
    this.container.id = this.id;
    this.container.style.width = `${this.width}px`;
    this.container.style.height = `${this.height}px`;
    this.container.style.position = "absolute";

    // Assume screen dimensions
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    /*
    // Remark: We could perform a general zoom scale for mobile devices
    if (screenWidth <= 980) {
        // this.container.style.zoom = 1.5; // Adjust zoom for mobile
    } else {
        // do nothing
    }
    */

    // Adjust position to prevent overlap
    let adjustedPosition = {
        x: this.x,
        y: this.y,
    };

    if (this.preventOverlap) {
        adjustedPosition = adjustPosition(
            { x: this.x, y: this.y, width: this.width, height: this.height },
            this.windowManager.windows,
            screenWidth,
            screenHeight,
            32
        );
    }


    // Apply adjusted position
    this.x = adjustedPosition.x;
    this.y = adjustedPosition.y;
    this.container.style.top = `${this.y}px`;
    this.container.style.left = `${this.x}px`;

    this.container.style.zIndex = 99;

    // add a mousedown handler to container itself to set 'window-active' status
    this.container.addEventListener('mousedown', () => {
        // set all windows to inactive
        document.querySelectorAll('.window-container').forEach((window) => {
            window.classList.remove('window-active');
            window.isActive = false;
        });
        // set this window to active
        this.container.classList.add('window-active');
        this.isActive = true;
    });

    // same for touchstart
    this.container.addEventListener('touchstart', () => {
        // set all windows to inactive
        document.querySelectorAll('.window-container').forEach((window) => {
            window.classList.remove('window-active');
            window.isActive = false;
        });
        // set this window to active
        this.container.classList.add('window-active');
        this.isActive = true;
    });

    // Create the title bar
    this.titleBar = document.createElement("div");
    this.titleBar.classList.add("window-title-bar");

    if (this.bp.isMobile()) {
        this.titleBar.onclick = () => {
            console.log('titleBar clicked on mobile');
            this.minimize();
            return;
            if (!this.isMinimized) {
                this.minimize(true); // force minimize on mobile
            } else {
                this.restore(); // restore on mobile
            }
        }
    }

    // on double click maximize
    this.titleBar.ondblclick = () => this.maximize();

    if (this.icon) {
        let iconTitleBar = document.createElement("img");
        iconTitleBar.src = this.icon;
        iconTitleBar.classList.add("window-icon");
        this.titleBar.appendChild(iconTitleBar);
    }

    let titleBarSpan = document.createElement("span");
    titleBarSpan.classList.add("window-title-text");
    titleBarSpan.textContent = this.title;
    this.titleBarSpan = titleBarSpan;

    // Drag functionality
    // Add mouse and touch event listeners to the titleBar
    this.titleBar.addEventListener('mousedown', this.startDrag);
    this.titleBar.addEventListener('touchstart', this.startDrag, { passive: false });

    // Touch events for mobile


    // Create control buttons (Minimize, Maximize, Close)
    const controls = document.createElement("div");
    controls.classList.add("window-controls");

    if (!this.bp.isMobile()) {
        this.minimizeButton = document.createElement("button");
        this.minimizeButton.innerHTML = "&#x1F7E1;"; // Yellow circle
        this.minimizeButton.classList.add("minimize-button");
        this.minimizeButton.title = "Minimize";
        this.minimizeButton.onclick = () => this.minimize();

        controls.appendChild(this.minimizeButton);


    }


    this.maximizeButton = document.createElement("button");
    this.maximizeButton.innerHTML = "&#x1F7E2;"; // Green circle
    this.maximizeButton.classList.add("maximize-button");
    this.maximizeButton.title = "Maximize";
    this.maximizeButton.onclick = () => this.maximize();

    controls.appendChild(this.maximizeButton);


    this.closeButton = document.createElement("button");
    this.closeButton.innerHTML = "&#x1F534;"; // Red circle
    this.closeButton.classList.add("close-button");
    this.closeButton.title = "Close";
    this.closeButton.onclick = () => this.close();

    controls.appendChild(this.closeButton);

    this.titleBar.appendChild(titleBarSpan);
    this.titleBar.appendChild(controls);

    this.initContentArea();

    // Append components
    this.container.appendChild(this.titleBar);
    this.container.appendChild(this.content);

    if (this.parent) {
        this.parent.appendChild(this.container);
    }

    // Resizing
    if (this.resizeable) {
        this.addResizeHandles();
    }

    if (this.canBeBackground) {
        // get the menubar-set-window-as-background element and remove disabled class
        let el = document.getElementById('menubar-set-window-as-background');
        if (el) {
            el.classList.remove('disabled');
        }
    }


    return this.container;
}

