export default class ChatWindowButtonBar {
  constructor(bp, options = {}) {
    this.bp = bp;
    this.options = options;
    console.log('ChatWindowButtonBar options', options);
    // Button objects provided via options
    const inputButtons = options.buttons || [];

    // Read stored order of button labels
    const storedOrder = this.bp.settings?.['buttonBar.buttons'];

    if (Array.isArray(storedOrder)) {
      // Sort input buttons by stored order
      this.buttons = this.sortButtonsByOrder(inputButtons, storedOrder);
    } else {
      this.buttons = inputButtons;
    }

    this.container = this.render();       // DOM
    this.enableDragAndDrop();             // jQuery UI sorting
    return this;
  }

  render() {
    const buttonBar = document.createElement('div');
    buttonBar.classList.add('button-bar');

    // create top-level (root) items
    this.buttons.forEach(button => {
      const element = this.createButtonElement(button, true); // <-- pass isRoot = true
      buttonBar.appendChild(element);
    });

    return buttonBar;
  }

  /**
   * createButtonElement(button, isRoot)
   * - isRoot: true for top-level buttons (draggable, dataset.text set)
   *           false for child/dropdown items (not draggable)
   */
  createButtonElement(button, isRoot = false) {
    // Create wrapper for either a single button or a dropdown
    const wrapper = document.createElement('div');
    wrapper.classList.add('button-bar-item');

    // Mark top-level wrappers so sortable only acts on them
    if (isRoot) {
      wrapper.classList.add('button-bar-item--root');
      // IMPORTANT: attach the text identifier to the wrapper so ordering works
      wrapper.dataset.text = button.text;
    }

    // Base button (icon / image / text)
    let element;
    if (button.image) {
      element = document.createElement('img');
      element.src = button.image;
      element.alt = button.text;
      element.title = button.text;
      element.draggable = false;
    } else if (button.icon) {
      element = document.createElement('span');
      element.innerHTML = button.icon;
    } else {
      element = document.createElement('button');
      element.innerText = button.text;
    }

    // Base dataset on the actual clickable element (keeps existing logic)
    const baseDataset = {
      context: this.options.context || button.text,
      type: this.options.type || 'buddy',
      text: button.text
    };
    Object.entries(baseDataset).forEach(([k, v]) => element.dataset[k] = v);

    element.classList.add('button-bar-button');
    if (button.className) element.classList.add(button.className);

    // If button has children → create dropdown
    if (Array.isArray(button.children) && button.children.length > 0) {
      wrapper.classList.add('has-children');

      // Dropdown container
      const dropdown = document.createElement('div');
      dropdown.classList.add('button-dropdown');
      dropdown.style.display = 'none';

      // Inside createButtonElement, in the children loop:
      button.children.forEach(child => {
        // Create wrapper for the child item
        const childWrapper = document.createElement('div');
        childWrapper.classList.add('dropdown-item');

        // Create the base element (icon/image/button)
        const childBaseEl = this.createButtonElement(child, false);
        childBaseEl.classList.remove('button-bar-item'); // avoid nested wrappers confusion

        // Create the text label
        const label = document.createElement('span');
        label.innerText = child.text;
        label.classList.add('dropdown-label');

        // Put both inside wrapper
        childWrapper.appendChild(childBaseEl);
        childWrapper.appendChild(label);

        // Unified click handler
        const clickHandler = (ev) => {
          ev.stopPropagation();
          if (typeof child.onclick === 'function') {
            child.onclick(ev);
          }
          // optionally: close dropdown after click
          dropdown.style.display = 'none';
        };

        // add baseDataset to childWrapper for consistency
        Object.entries(baseDataset).forEach(([k, v]) => childWrapper.dataset[k] = v);
        // add baseDataset to childBaseEl too for consistency
        Object.entries(baseDataset).forEach(([k, v]) => childBaseEl.dataset[k] = v);
        // add baseDataset to label too for consistency
        Object.entries(baseDataset).forEach(([k, v]) => label.dataset[k] = v);

        childWrapper.addEventListener('click', clickHandler);

        dropdown.appendChild(childWrapper);
      });


      // Toggle dropdown on click
      element.addEventListener('click', (ev) => {
        ev.stopPropagation();
        dropdown.style.display = (dropdown.style.display === 'none') ? 'block' : 'none';
      });

      // Close dropdown if clicking outside
      document.addEventListener('click', () => {
        dropdown.style.display = 'none';
      });

      wrapper.appendChild(element);
      wrapper.appendChild(dropdown);
    } else {
      // Plain button case: attach onclick handler
      if (typeof button.onclick === 'function') {
        element.addEventListener('click', button.onclick);
      }
      wrapper.appendChild(element);
    }

    return wrapper;
  }

  addButton(button) {
    if (this.buttons.some(b => b.text === button.text)) {
      console.warn(`Button with text "${button.text}" already exists.`);
      return;
    }

    this.buttons.push(button);
    const newButtonElement = this.createButtonElement(button, true); // root
    this.container.appendChild(newButtonElement);
    this.refreshSortable();
  }

  removeButton(buttonText) {
    const index = this.buttons.findIndex(button => button.text === buttonText);
    if (index === -1) return;

    this.buttons.splice(index, 1);

    // Only remove top-level (root) wrappers
    const roots = Array.from(this.container.children).filter(el => el.classList.contains('button-bar-item--root'));
    for (const el of roots) {
      if (el.dataset.text === buttonText) {
        this.container.removeChild(el);
        break;
      }
    }

    this.refreshSortable();
    this.saveButtonOrder();
  }

  enableDragAndDrop() {
    $(this.container).sortable({
      // Only root-level items are sortable
      items: '.button-bar-item--root',
      tolerance: 'pointer',
      stop: () => this.syncButtonOrder()
    });
  }

  refreshSortable() {
    $(this.container).sortable('refresh');
  }

  syncButtonOrder() {
    // Read order only from top-level wrapper elements
    const roots = Array.from(this.container.children).filter(el => el.classList.contains('button-bar-item--root'));
    const orderedTexts = roots.map(el => el.dataset.text);
    console.log('syncButtonOrder orderedTexts', orderedTexts);

    // Rebuild this.buttons in the new order using the original objects (match by text)
    this.buttons = orderedTexts
      .map(text => this.buttons.find(b => b.text === text))
      .filter(Boolean);

    console.log('syncButtonOrder new this.buttons', this.buttons);
    this.saveButtonOrder();
  }

  saveButtonOrder() {
    // this.buttons should now reflect the new order
    console.log('saveButtonOrder this.buttons', this.buttons);
    const orderedTexts = this.buttons.map(b => b.text);
    this.bp.set('buttonBar.buttons', orderedTexts);

    const openWindows = this.bp.apps.ui.windowManager.findWindows({
      app: 'buddylist',
      type: ['buddy', 'pond']
    });

    openWindows.forEach(window => {
      if (window.buttonBar) {
        // Reorder buttons on other windows (they store button objects too)
        window.buttonBar.buttons = this.sortButtonsByOrder(window.buttonBar.buttons, orderedTexts);

        // Re-render DOM in other windows
        window.buttonBar.reRenderButtons();
      }
    });
  }

  // used when making a remote change to the button order from an outside source
  // drag and drop does not use this method and instead uses syncButtonOrder
  // reRenderButtons should recreate top-level wrappers as root items
  reRenderButtons() {
    // Clear the container
    this.container.innerHTML = '';

    // Recreate and append all buttons in current order (root)
    this.buttons.forEach(button => {
      const el = this.createButtonElement(button, true);
      this.container.appendChild(el);
    });

    // Re-enable drag and drop after replacing children
    this.refreshSortable();
  }

  sortButtonsByOrder(buttons, order) {
    const buttonMap = Object.fromEntries(buttons.map(b => [b.text, b]));
    const ordered = order.map(text => buttonMap[text]).filter(Boolean);

    // Append any new buttons not in stored order
    const remaining = buttons.filter(b => !order.includes(b.text));
    return [...ordered, ...remaining];
  }
}
