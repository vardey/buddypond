import api from './lib/api.js';
import fishingClient from './lib/fishingClient.js';

export default class Fishing {
  constructor(bp, options = {}) {
    this.bp = bp;
    this.options = options;
    this.client = fishingClient;
    this.win = null;
    this.html = null;
    return this;
  }

  /** Called when the app is loaded */
  async init() {
    this.html = await this.bp.load('/v5/apps/based/fishing/fishing.html');
    await this.bp.load('/v5/apps/based/fishing/fishing.css');
    return 'loaded Fishing';
  }

  /** Equip an item */
  async equipItem(inventory_id) {
    try {
      let result = await this.client.apiRequest(`/equip`, 'POST', { inventory_id });
      console.log('Equip item result:', result);
    } catch (err) {
      console.error('Error during equip item:', err);
    }
  }

  /** Open the fishing window */
  async open() {
    if (!this.win) {
      this.win = await this.bp.window(this.window());
      console.log('Fish data loaded:', api.Fish);

      this.bindEvents();
    }

    await this.loadEquipped();
    await this.loadItems();
    await this.renderFishInventory();

    return this.win;
  }

  /** Window config */
  window() {
    return {
      id: 'fishing',
      title: 'Fishing',
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
    };
  }

  /* ------------------
   * UI + RENDER METHODS
   * ------------------ */

  renderFishItem(item) {
    if (typeof item.item_def === 'string') {
      item.item_def = JSON.parse(item.item_def);
    }

    let favoriteButton = `<button class="fishing-favorite-item" data-inventory-id="${item.id}">Favorite</button>`;
    if (item.favorited === 1) {
      favoriteButton = `<button class="fishing-unfavorite-item" data-inventory-id="${item.id}">Unfavorite</button>`;
    }

    return `<div class="fishing-item">
      <strong>${item.item_def.name}</strong><br/>
      Type: ${item.item_def.type}<br/>
      Rarity: ${item.item_def.rarity}<br/>
      Description: ${item.item_def.description}<br/>
      <button class="fishing-equip-item" data-inventory-id="${item.id}">Equip</button>
      ${favoriteButton}
      <button class="fishing-give-item" data-inventory-id="${item.id}">Give</button>
      <button class="fishing-sell-item" data-inventory-id="${item.id}">Sell</button>
    </div>`;
  }

  renderFishInventoryItem(item) {
    if (typeof item.item_def === 'string') {
      item.item_def = JSON.parse(item.item_def);
    }

    let favoriteButton = `<button class="fishing-favorite-item" data-inventory-id="${item.id}">Favorite</button>`;
    if (item.favorited === 1) {
      favoriteButton = `<button class="fishing-unfavorite-item" data-inventory-id="${item.id}">Unfavorite</button>`;
    }

    console.log('Rendering fish inventory item:', item);
    return `<div class="fishing-item">
      <strong>${item.item_def.name}</strong><br/>
      Type: ${item.item_def.type}<br/>
      Rarity: ${item.item_def.rarity}<br/>
      Description: ${item.item_def.description}<br/>
      <button class="fishing-sell-item" data-inventory-id="${item.id}">Sell</button>
      ${favoriteButton}
      <button class="fishing-give-item" data-inventory-id="${item.id}">Give</button>
    </div>`;
  }

  async renderFishInventory() {
    let fishInventory = await this.client.apiRequest('/inventory', 'GET');
    console.log('Player fishing inventory:', fishInventory);

    let html = fishInventory.map(item => this.renderFishInventoryItem(item)).join('');
    $('.fishing-inventory-list', this.win.content).empty().append(html);
  }

  /* ------------------
   * API LOADING METHODS
   * ------------------ */

  async loadEquipped() {
    let equipped = await this.client.apiRequest('/equipped', 'GET');
    console.log('Player fishing equipped:', equipped);

    let equippedHtml = `<h3>Equipped Items</h3>`;
    if (equipped) {

      equipped.forEach(item => {
        equippedHtml += `<div class="fishing-item">
          <strong>${item.metadata.key}</strong><br/>
          Type: ${item.metadata.key}<br/>
          Rarity: ${item.metadata.rarity}<br/>
          Durability: ${item.metadata.item_durability}<br/>
        </div>`;

      });
    } else {
      equippedHtml += `<p>No fishing rod equipped.</p>`;
    }
    $('.fishing-equipped', this.win.content).html(equippedHtml);
  }

  async loadItems() {
    let items = await this.client.apiRequest('/items', 'GET');
    console.log('Player fishing items:', items);

    items.forEach(item => {
      let itemDef = JSON.parse(item.item_def);
      console.log('Item def:', itemDef);
      let itemHtml = this.renderFishItem(item);
      $('.fishing-items', this.win.content).append(itemHtml);
    });
  }

  /* ------------------
   * EVENT BINDING
   * ------------------ */

  bindEvents() {
    // Cast fishing line
    $('.fishing-cast', this.win.content).on('click', this.handleCast.bind(this));

    // Sell all items
    $('.fishing-sell-all', this.win.content).on('click', this.handleSellAll.bind(this));

    $('.fishing-app', this.win.content).on('click', '.fishing-favorite-item', async (e) => {
      const inventoryId = $(e.currentTarget).data('inventory-id');
      await this.client.apiRequest(`/inventory/favorite`, 'POST', { inventory_id: inventoryId });
      // update the button to unfavorite
      $(e.currentTarget).replaceWith(`<button class="fishing-unfavorite-item" data-inventory-id="${inventoryId}">Unfavorite</button>`);
    });

    $('.fishing-app', this.win.content).on('click', '.fishing-unfavorite-item', async (e) => {
      const inventoryId = $(e.currentTarget).data('inventory-id');
      await this.client.apiRequest(`/inventory/unfavorite`, 'POST', { inventory_id: inventoryId });
      // update the button to favorite
      $(e.currentTarget).replaceWith(`<button class="fishing-favorite-item" data-inventory-id="${inventoryId}">Favorite</button>`);
    });
    
    // sell item 
    $('.fishing-app', this.win.content).on('click', '.fishing-sell-item', async (e) => {
      const inventoryId = $(e.currentTarget).data('inventory-id');
      // '/api/fishing/sell/:item_id
      let result = await this.client.apiRequest(`/sell/${inventoryId}`, 'POST');
      console.log('Sell item result:', result);
      if (result.success) {
        // remove the item from the inventory list
        $(e.currentTarget).closest('.fishing-item').remove();
        // show a message
        $('.fishing-results', this.win.content).prepend(`<p>Sold item for ${result.value} coins.</p>`);
      } else {
        alert(`Error selling item: ${result.error}`);
      }
    });

    // fishing-give-item
    $('.fishing-app', this.win.content).on('click', '.fishing-give-item', async (e) => {
      const inventoryId = $(e.currentTarget).data('inventory-id');
      let buddyname = prompt('Enter the buddyname of the player to give this item to:');
      if (buddyname) {
        let result = await this.client.apiRequest('/give', 'POST', { inventory_id: inventoryId, to_buddyname: buddyname });
        console.log('Give item result:', result);
        if (result.success) {
          // remove the item from the inventory list
          $(e.currentTarget).closest('.fishing-item').remove();
          // show a message
          $('.fishing-results', this.win.content).prepend(`<p>Gave item to ${buddyname}.</p>`);
        } else {
          alert(`Error giving item: ${result.error}`);
        }
      }
    });

    // fishing-equip-item
    $('.fishing-app', this.win.content).on('click', '.fishing-equip-item', async (e) => {
      const inventoryId = $(e.currentTarget).data('inventory-id');
      await this.equipItem(inventoryId);
      await this.loadEquipped();
    });


  }

  async handleCast() {
    try {
      let result = await this.client.apiRequest('/cast', 'GET');
      console.log('Fishing cast result:', result);

      let resultsDiv = $('.fishing-results', this.win.content).empty();
      let resultHtml = `<p>You caught a <strong>${result.name}</strong> (Rarity: ${result.rarity})</p>`;
      resultHtml += `<p>Value: ${result.value} coins</p>`;
      if (result.mutation) {
        resultHtml += `<p>Mutation occurred! You also caught a <strong>${result.mutation.name}</strong> (Rarity: ${result.mutation.rarity})</p>`;
      }
      resultsDiv.prepend(resultHtml);

      if (typeof result.item_def === 'string') {
        result.item_def = JSON.parse(result.item_def);
      }

      if (result.item_def.type === 'fish') {
        let itemHtml = this.renderFishInventoryItem(result);
        $('.fishing-inventory-list', this.win.content).prepend(itemHtml);
      }
      if (result.item_def.type === 'fishing-item') {
        let itemHtml = this.renderFishItem(result);
        $('.fishing-items', this.win.content).prepend(itemHtml);
      }

    } catch (err) {
      console.error('Error during fishing cast:', err);
      $('.fishing-status', this.win.content).html(
        `<span style="color:red;">Error: ${err.message}</span>`
      );
    }
  }

  async handleSellAll() {
    let result = await this.client.apiRequest('/sell-all', 'POST');
    console.log('Sell all items result:', result);

    let resultsDiv = $('.fishing-results', this.win.content).empty();
    let resultHtml = `<p>Sold ${result.sold_count} items for a total of ${result.totalValue} coins.</p>`;
    resultsDiv.prepend(resultHtml);

    await this.renderFishInventory();
  }
}
