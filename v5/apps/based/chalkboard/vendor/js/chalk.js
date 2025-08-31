// Refactored and enhanced Chalkboard App

document.addEventListener("DOMContentLoaded", chalkboard);

function chalkboard() {

  // app will broadcast to the desktop channel itself
  const channel = new BroadcastChannel("buddypond-desktop");
  channel.postMessage({ type: "app", app: "chalkboard", action: "open" });

  // app doesn't need to listen for desktop messages, but can if needed
  //channel.onmessage = (event) => console.log("chalkboard received:", event.data);

  // TODO: we could have better control of saving instead of using the timer
  // this implies an additional broadcast channel with specific app namespace
  // probably better than having each app listen for all desktop messages by default...
  const receiver = new BroadcastChannel("buddypond-chalkboard");
  receiver.onmessage = (event) => {
    if (event.data.action === 'load') {
      console.log('chalkboard received load command', event.data);
      if (event.data.src) {
        loadImageToCanvas(event.data.src);
      } else {
        console.error('chalkboard load command missing src');
      }
    }
  };

  cleanupExistingElements();
  createUI();

  const canvas = document.getElementById("chalkboard");
  const ctx = canvas.getContext("2d");
  const width = canvas.width = window.innerWidth;
  const height = canvas.height = window.innerHeight;
  let mouseX = 0, mouseY = 0, mouseD = false, eraser = false;
  let xLast = 0, yLast = 0;
  let chalkColor = "rgba(255,255,255,0.5)";
  const brushDiameter = 7;
  const eraserWidth = 50;
  const eraserHeight = 100;

  const chalk = document.querySelector(".chalk");
  const patImg = document.getElementById("pattern");
  patImg.crossOrigin = "anonymous";


  canvas.style.cursor = "none";
  document.onselectstart = () => false;
  ctx.lineCap = "round";
  ctx.lineWidth = brushDiameter;

  // Event handlers
  document.addEventListener("touchmove", handleTouchMove, false);
  document.addEventListener("touchstart", handleTouchStart, false);
  document.addEventListener("touchend", () => (mouseD = false), false);
  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mousedown", handleMouseDown);
  document.addEventListener("mouseup", handleMouseUp);
  document.addEventListener("keyup", handleKeyUp);
  document.oncontextmenu = () => false;

  document.querySelector(".save-button").addEventListener("click", saveImage);
  document.getElementById("clearBtn").addEventListener("click", () => ctx.clearRect(0, 0, width, height));
  document.getElementById("colorPicker").addEventListener("change", (e) => (chalkColor = hexToRGBA(e.target.value)));

  function handleTouchMove(evt) {
    const touch = evt.touches[0];
    mouseX = touch.pageX;
    mouseY = touch.pageY;
    if (mouseY < height && mouseX < width) {
      evt.preventDefault();
      moveChalk(mouseX, mouseY);
      if (mouseD) draw(mouseX, mouseY);
    }
  }

  function handleTouchStart(evt) {
    const touch = evt.touches[0];
    mouseD = true;
    xLast = mouseX = touch.pageX;
    yLast = mouseY = touch.pageY;
    draw(mouseX + 1, mouseY + 1);
  }

  function handleMouseMove(evt) {
    mouseX = evt.pageX;
    mouseY = evt.pageY;
    if (mouseY < height && mouseX < width) {
      moveChalk(mouseX, mouseY);
      if (mouseD) eraser ? erase(mouseX, mouseY) : draw(mouseX, mouseY);
    } else chalk.style.top = height - 10 + "px";
  }

  function handleMouseDown(evt) {
    mouseD = true;
    xLast = mouseX;
    yLast = mouseY;
    if (evt.button === 2) {
      eraser = true;
      chalk.classList.add("eraser");
      erase(mouseX, mouseY);
    } else if (!evt.target.closest(".panel")) {
      draw(mouseX + 1, mouseY + 1);
    }
  }

  function handleMouseUp(evt) {
    mouseD = false;
    if (evt.button === 2) {
      eraser = false;
      chalk.classList.remove("eraser");
    }
  }

  function handleKeyUp(evt) {
    if (evt.keyCode === 32) ctx.clearRect(0, 0, width, height);
    if (evt.keyCode === 83) changeLink();
  }

  function moveChalk(x, y) {
    chalk.style.left = x - brushDiameter / 2 + "px";
    chalk.style.top = y - brushDiameter / 2 + "px";
  }

  function draw(x, y) {
    ctx.strokeStyle = chalkColor.replace(/\d?\.?\d+\)$/g, `${0.4 + Math.random() * 0.2})`);
    ctx.beginPath();
    ctx.moveTo(xLast, yLast);
    ctx.lineTo(x, y);
    ctx.stroke();

    const length = Math.round(
      Math.sqrt(Math.pow(x - xLast, 2) + Math.pow(y - yLast, 2)) / (5 / brushDiameter)
    );
    const xUnit = (x - xLast) / length;
    const yUnit = (y - yLast) / length;
    for (let i = 0; i < length; i++) {
      const xCurrent = xLast + i * xUnit;
      const yCurrent = yLast + i * yUnit;
      const xRandom = xCurrent + (Math.random() - 0.5) * brushDiameter * 1.2;
      const yRandom = yCurrent + (Math.random() - 0.5) * brushDiameter * 1.2;
      ctx.clearRect(xRandom, yRandom, Math.random() * 2 + 2, Math.random() + 1);
    }
    xLast = x;
    yLast = y;
  }

  function erase(x, y) {
    ctx.clearRect(x - eraserWidth / 2, y - eraserHeight / 2, eraserWidth, eraserHeight);
  }

  function loadImageToCanvas(src) {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => ctx.drawImage(img, 0, 0, width, height);
    img.src = src;
  }
  function saveImage() {
    const saveButton = document.querySelector(".save-button");

    if (saveButton) {
      // Store original content to restore later
      const originalText = saveButton.innerHTML;

      // Set visual feedback
      saveButton.disabled = true;
      saveButton.innerHTML = `<span class="spinner" style="
      display: inline-block;
      width: 1em;
      height: 1em;
      border: 2px solid #fff;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-right: 0.5em;"></span>Saving…`;

      // Re-enable button after delay
      setTimeout(() => {
        saveButton.disabled = false;
        saveButton.innerHTML = originalText;
      }, 5000); // 5 seconds debounce
    }

    // Remove old download preview
    const downloadEl = document.querySelector(".download");
    if (downloadEl) downloadEl.remove();

    // Setup drawing canvas
    const imgCanvas = document.createElement("canvas");
    const imgCtx = imgCanvas.getContext("2d");
    imgCanvas.width = width;
    imgCanvas.height = height;

    // Fill background with pattern
    imgCtx.fillStyle = imgCtx.createPattern(patImg, "repeat");
    imgCtx.fillRect(0, 0, width, height);

    // Copy the working canvas directly
    imgCtx.drawImage(canvas, 0, 0);

    // Export safely
    try {
      const compimage = imgCanvas.toDataURL("image/png");
      channel.postMessage({
        type: "app",
        app: "chalkboard",
        action: "save",
        image: compimage,
        timestamp: Date.now()
      });
    } catch (err) {
      console.error("Failed to save image:", err);
      alert("Sorry, unable to save this drawing due to cross-origin image restrictions.");
    }
  }


  function changeLink() {
    // Placeholder for existing logic
  }

  function hexToRGBA(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},0.5)`;
  }

  function cleanupExistingElements() {
    ["chalkboard", "pattern"].forEach((id) => document.getElementById(id)?.remove());
    document.querySelector(".chalk")?.remove();
  }

  function createUI() {
    const panel = document.createElement("div");
    panel.className = "panel";
    panel.innerHTML = `
  <a class="save-button" target="_blank">Save</a>
  <button id="clearBtn">Clear</button>
  <input type="color" id="colorPicker" class="colorPicker" value="#ffffff" title="Pick Chalk Color">
`;

    document.body.prepend(panel);

    const pattern = document.createElement("img");
    pattern.crossOrigin = "anonymous";

    pattern.src = "img/bg.png";
    pattern.id = "pattern";
    pattern.width = 50;
    pattern.height = 50;
    document.body.prepend(pattern);

    const canvas = document.createElement("canvas");
    canvas.id = "chalkboard";
    document.body.prepend(canvas);

    const chalkDiv = document.createElement("div");
    chalkDiv.className = "chalk";
    document.body.prepend(chalkDiv);
  }

  window.addEventListener("resize", () => {
    // Optional: implement dynamic resizing
  });
}