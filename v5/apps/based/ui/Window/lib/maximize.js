export default function maximize({ fullWindow = false } = {}) {
  const getMenuBarOffset = () => {
    const normalMenuBarHeight = 21;
    const currentMenuBarHeight = $('.desktop-menu-bar').height() || normalMenuBarHeight;
    const diff = currentMenuBarHeight - normalMenuBarHeight + (normalMenuBarHeight + 2); // add 2px for border
    return `${diff}px`;
  };

  const applyMobileStyles = () => {
    this.container.style.width = "100vw";
    this.container.style.height = 'calc(var(--vh) * 90)';
    this.container.style.top = "0";
    this.container.style.left = "0";
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
    this.container.style.top = "50px";
    this.container.style.left = "50px";
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
    this.container.style.top = pixelOffset;
    this.container.style.left = "0";
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