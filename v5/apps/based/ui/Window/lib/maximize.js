export default function maximize({ fullWindow = false } = {}) {
  const getMenuBarOffset = () => {
    const normalMenuBarHeight = 21;
    const currentMenuBarHeight = $('.desktop-menu-bar').height() || normalMenuBarHeight;
    const diff = currentMenuBarHeight - normalMenuBarHeight + (normalMenuBarHeight + 2); // add 2px for border
    return diff;
  };

  const applyMobileStyles = () => {
    this.container.style.width = "100vw";
    this.container.style.height = 'calc(var(--vh) * 90)';
    let relativeTop = window.scrollY;
    let relativeLeft = window.scrollX;
    this.container.style.top = `${relativeTop}px`;
    this.container.style.left = `${relativeLeft}px`;
  };

  const applyDiscordViewStyles = (isFullWindow) => {
    if (isFullWindow) {
      this.container.style.width = "calc(100vw - 75px)";
      this.container.style.height = 'calc(var(--vh) * 95)';
      this.container.style.top = "20px";
      this.container.style.left = "75px";
    } else {
      this.container.style.width = "90vw";
      this.container.style.height = 'calc(var(--vh) * 90)';
      this.container.style.top = "0";
      this.container.style.left = "75px";
    }
  };

  const applyDefaultUnmaximizedStyles = () => {
    this.container.style.width = `${this.width}px`;
    this.container.style.height = `${this.height}px`;

    // top and left values should be relative to the current scroll position of the window
    let relativeTop = 50 + window.scrollY;
    let relativeLeft = 50 + window.scrollX;
    this.container.style.top = `${relativeTop}px`;
    this.container.style.left = `${relativeLeft}px`;
    this.isMaximized = false;
  };

  const applyMaximizedDiscordViewStyles = (isFullWindow) => {
    if (isFullWindow) {
      this.container.style.width = "100vw";
      this.container.style.height = 'calc(var(--vh) * 95)';
      this.container.style.top = "20px";
      this.container.style.left = "0";
    } else {
      this.container.style.width = "calc(var(--vw) - 72px)";
      this.container.style.height = 'calc(var(--vh) * 100)';
      this.container.style.top = "20px";
      this.container.style.left = "72px";
    }
  };

  const applyDefaultMaximizedStyles = () => {
    const pixelOffset = getMenuBarOffset();
    this.container.style.width = "100vw";
    this.container.style.height = "calc(100vh - 104px)";

    // Adjust top position based on menu bar height
    let relativeTop = parseInt(pixelOffset, 10) + window.scrollY;
    let relativeLeft = 0 + window.scrollX;
    this.container.style.top = `${relativeTop}px`;
    this.container.style.left = `${relativeLeft}px`;
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