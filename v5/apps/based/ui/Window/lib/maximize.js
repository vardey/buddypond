export default function maximize({ fullWindow = false } = {}) {
  // Cache menu bar height (aligned with WindowDrag's static caching suggestion)
  const getMenuBarOffset = () => {
    const normalMenuBarHeight = 21;
    const menuBar = document.querySelector('.desktop-menu-bar');
    const currentMenuBarHeight = menuBar?.offsetHeight || normalMenuBarHeight;
    return currentMenuBarHeight - normalMenuBarHeight + (normalMenuBarHeight + 2); // Add 2px for border
  };

  // Helper to apply styles using transforms
  const applyTransformStyles = (width, height, translateX, translateY) => {
    this.container.style.width = width;
    this.container.style.height = height;
    this.container.style.top = '0px'; // Reset top/left to avoid conflicts
    this.container.style.left = '0px';
    this.container.style.transform = `translate3d(${translateX}px, ${translateY}px, 0)`;

    // Update WindowDrag state to sync transform
    if (this.dragInstance) { // Assuming WindowDrag instance is stored as this.dragInstance
      this.dragInstance.tx = translateX;
      this.dragInstance.ty = translateY;
      this.dragInstance.nextX = translateX;
      this.dragInstance.nextY = translateY;
      this.dragInstance.isDragging = false; // Prevent drag interference
    }
  };

  const applyMobileStyles = () => {
    const translateX = window.scrollX;
    const translateY = window.scrollY;
    applyTransformStyles('100vw', 'calc(var(--vh) * 90)', translateX, translateY);
    this.isMaximized = true;
  };

  const applyDiscordViewStyles = (isFullWindow) => {
    if (isFullWindow) {
      applyTransformStyles('calc(100vw - 75px)', 'calc(var(--vh) * 95)', 75, 20);
    } else {
      applyTransformStyles('90vw', 'calc(var(--vh) * 90)', 75, 0);
    }
    this.isMaximized = true;
  };

  const applyDefaultUnmaximizedStyles = () => {
    const translateX = 50 + window.scrollX;
    const translateY = 50 + window.scrollY;
    applyTransformStyles(`${this.width}px`, `${this.height}px`, translateX, translateY);
    this.isMaximized = false;
  };

  const applyMaximizedDiscordViewStyles = (isFullWindow) => {
    if (isFullWindow) {
      applyTransformStyles('100vw', 'calc(var(--vh) * 95)', 0, 20);
    } else {
      applyTransformStyles('calc(100vw - 72px)', 'calc(var(--vh) * 100)', 72, 20);
    }
    this.isMaximized = true;
  };

  const applyDefaultMaximizedStyles = () => {
    const pixelOffset = getMenuBarOffset();
    const translateX = window.scrollX;
    const translateY = pixelOffset + window.scrollY;
    applyTransformStyles('100vw', 'calc(100vh - 104px)', translateX, translateY);
    this.isMaximized = true;
  };

  // Main logic
  if (this.isMaximized) {
    if (this.bp.isMobile()) {
      applyMobileStyles();
    } else if (window.discordView) {
      applyDiscordViewStyles(fullWindow);
    } else {
      applyDefaultUnmaximizedStyles();
    }
  } else {
    if (this.bp.isMobile()) {
      applyMobileStyles();
    } else if (window.discordView) {
      applyMaximizedDiscordViewStyles(fullWindow);
    } else {
      applyDefaultMaximizedStyles();
    }
  }

  // TODO: save the window state
}