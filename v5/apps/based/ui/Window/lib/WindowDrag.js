const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

export default class WindowDrag {
  static activeDrag = null;
  static isListening = false;
  static overlay = null;

  constructor(container, handle = container) {
    this.container = container;
    this.handle = handle;

    this.tx = 0;
    this.ty = 0;
    this.nextX = 0;
    this.nextY = 0;
    this.framePending = false;
    this.isDragging = false;

    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);

    handle.addEventListener("pointerdown", this.onPointerDown);

    // ensure global listeners + overlay only once
    if (!WindowDrag.isListening) {
      document.addEventListener("pointermove", WindowDrag.handleGlobalMove);
      document.addEventListener("pointerup", WindowDrag.handleGlobalUp);
      document.addEventListener("pointercancel", WindowDrag.handleGlobalUp);

      WindowDrag.ensureOverlay();
      WindowDrag.isListening = true;
    }
  }

  static ensureOverlay() {
  if (!WindowDrag.overlay) {
    const overlay = document.createElement("div");
    Object.assign(overlay.style, {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      zIndex: 999999,
      background: "green",
      opacity: 0,
      cursor: "grabbing",
      visibility: "hidden", // Initialize as hidden
    });
    document.body.appendChild(overlay);
    WindowDrag.overlay = overlay;
  }
}

static showOverlay() {
  if (WindowDrag.overlay) {
    WindowDrag.overlay.style.visibility = "visible";
  }
}

static hideOverlay() {
  if (WindowDrag.overlay) {
    WindowDrag.overlay.style.visibility = "hidden";
  }
}

  static handleGlobalMove(e) {
    if (WindowDrag.activeDrag) {
      WindowDrag.activeDrag.onPointerMove(e);
    }
  }

  static handleGlobalUp(e) {
    if (WindowDrag.activeDrag) {
      WindowDrag.activeDrag.onPointerUp(e);
      WindowDrag.activeDrag = null;
    }
  }

  // === Instance methods ===
  initFromComputedPosition() {
    const rect = this.container.getBoundingClientRect();
    const parentRect =
      this.container.offsetParent?.getBoundingClientRect?.() || {
        left: 0,
        top: 0,
      };
    this.tx = rect.left - parentRect.left;
    this.ty = rect.top - parentRect.top;
    this.container.style.left = "0px";
    this.container.style.top = "0px";
    this.container.style.transform = `translate3d(${this.tx}px, ${this.ty}px, 0)`;
  }

  onPointerDown(e) {
    if (e.target.closest(".window-controls")) return;
    // console.log("WindowDrag: onPointerDown called");

    this.isDragging = true;
    WindowDrag.activeDrag = this;
    this.handle.setPointerCapture(e.pointerId);

    WindowDrag.showOverlay();

    // Element rect in viewport -> to document coords:
    const rect = this.container.getBoundingClientRect();
    const scrollX =
      window.scrollX ||
      window.pageXOffset ||
      document.documentElement.scrollLeft;
    const scrollY =
      window.scrollY ||
      window.pageYOffset ||
      document.documentElement.scrollTop;
    const pageLeft = rect.left + scrollX;
    const pageTop = rect.top + scrollY;

    // Current transform translation
    const style = getComputedStyle(this.container).transform;
    const m =
      style && style !== "none" ? new DOMMatrix(style) : new DOMMatrix();
    this.tx = Number.isFinite(m.m41) ? m.m41 : 0;
    this.ty = Number.isFinite(m.m42) ? m.m42 : 0;

    // base (no-transform) document coords
    const baseLeft = pageLeft - this.tx;
    const baseTop = pageTop - this.ty;

    // Document size
    const docWidth = Math.max(
      document.documentElement.scrollWidth,
      document.documentElement.clientWidth,
      window.innerWidth
    );
    const docHeight = Math.max(
      document.documentElement.scrollHeight,
      document.documentElement.clientHeight,
      window.innerHeight
    );

    // margins / UI constraints
    const marginLeft = 5;
    const marginRight = 5;
    const menuBarHeight = document.querySelector(".desktop-menu-bar")?.offsetHeight || 20;
    const marginTop = menuBarHeight;
    const marginBottom = 5;

    // allowed bounds
    const minXDoc = marginLeft;
    const maxXDoc = docWidth - rect.width - marginRight;
    const minYDoc = marginTop;
    const maxYDoc = docHeight - rect.height - marginBottom;

    // convert to translate bounds
    this.minTranslateX = minXDoc - baseLeft;
    this.maxTranslateX = maxXDoc - baseLeft;
    this.minTranslateY = minYDoc - baseTop;
    this.maxTranslateY = maxYDoc - baseTop;

    // pointer start
    this.startPageX = e.clientX + scrollX;
    this.startPageY = e.clientY + scrollY;

    this.container.classList.add("dragging");
    document.body.style.userSelect = "none";
  }

  onPointerMove(e) {
    if (!this.isDragging) return;

    const scrollX =
      window.scrollX ||
      window.pageXOffset ||
      document.documentElement.scrollLeft;
    const scrollY =
      window.scrollY ||
      window.pageYOffset ||
      document.documentElement.scrollTop;
    const pageX = e.clientX + scrollX;
    const pageY = e.clientY + scrollY;

    const dx = pageX - this.startPageX;
    const dy = pageY - this.startPageY;

    const rawNextX = this.tx + dx;
    const rawNextY = this.ty + dy;

    this.nextX = clamp(rawNextX, this.minTranslateX, this.maxTranslateX);
    this.nextY = clamp(rawNextY, this.minTranslateY, this.maxTranslateY);

    if (!this.framePending) {
      this.framePending = true;
      requestAnimationFrame(() => {
        this.framePending = false;
        this.container.style.transform = `translate3d(${this.nextX}px, ${this.nextY}px, 0)`;
      });
    }
  }

  onPointerUp(e) {
    this.isDragging = false;
    // console.log("WindowDrag: onPointerUp called");

    WindowDrag.hideOverlay();

    try {
      this.handle.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }

    this.container.classList.remove("dragging");
    document.body.style.userSelect = "";
  }
}