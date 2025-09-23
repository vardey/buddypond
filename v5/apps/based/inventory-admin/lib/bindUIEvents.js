export default function bindUIEvents(container, items) {


$(function () {

      const $grid = $("#itemGrid");
      const $mintPanel = $("#mintPanel");
      const $selectedItem = $("#selectedItem");
      let selectedItem = null;

      // Render grid
      function renderItems(list) {
        $grid.empty();
        list.forEach(item => {
          const $el = $(`
        <div class="item" data-id="${item.id}">
          <img src="${item.icon}" alt="${item.name}">
          <span class="item-name">${item.name}</span>
          <span class="item-type">${item.type}</span>
        </div>
      `);
          $el.data("item", item);
          $grid.append($el);
        });
      }

      renderItems(items);

      // Search filter
      $("#search").on("input", function () {
        const term = $(this).val().toLowerCase();
        const filtered = items.filter(item =>
          item.name.toLowerCase().includes(term) || item.type.toLowerCase().includes(term)
        );
        renderItems(filtered);
      });

      // Select item
      $grid.on("click", ".item", function () {
        $(".item").removeClass("selected");
        $(this).addClass("selected");
        selectedItem = $(this).data("item");
        $selectedItem.html(`
      <div>
        <img src="${selectedItem.icon}" style="width:40px;height:40px;vertical-align:middle;margin-right:8px;">
        <strong>${selectedItem.name}</strong> <em>(${selectedItem.type})</em>
      </div>
    `);
        $("#mintBtn").prop("disabled", false);
      });

      // Mint button
      $("#mintBtn").on("click", function () {
        const player = $("#playerName").val().trim();
        if (!player) {
          alert("Please enter a player name.");
          return;
        }
        if (!selectedItem) {
          alert("Please select an item.");
          return;
        }

        // TODO: Replace with API call
        console.log("Minting item:", selectedItem, "to player:", player);
        alert(`Minted ${selectedItem.name} to ${player}!`);

        // Reset
        $("#playerName").val("");
        $(".item").removeClass("selected");
        $selectedItem.html("<p>No item selected</p>");
        selectedItem = null;
        $("#mintBtn").prop("disabled", true);
      });
    });

    }
