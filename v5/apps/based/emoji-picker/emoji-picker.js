
export default class EmojiPickerClass {
  constructor(bp) {
    this.bp = bp;
  }

  async init() {
    await this.bp.appendScript('/v5/apps/based/buddylist/vendor/emoji.min.js');
    await this.bp.appendScript('/v5/apps/based/emoji-picker/vendor/grapheme-splitter.min.js')
    this.jQueryPlugin();
    return 'loaded emoji picker';
  }
jQueryPlugin() {
  // singleton DOM
  let $picker = null;
  let $currentTrigger = null;
  let docHandlerAttached = false;

  const DEFAULTS = {
    autoShow: true,
    onSelect: (emoji) => {},
    categories: ['people','nature','food','activity','travel','objects','symbols','flags'],
    emojiData: EMOJIS,
  };

  function buildEmojiList(data) {
    return Object.entries(data || {}).map(([emoji, keywords]) => ({
      emoji,
      keywords,
      name: keywords[0] || '',
      search: (keywords.join(' ') + ' ' + emoji).toLowerCase()
    }));
  }

  function renderPicker(settings, filter = '') {
    if (!$picker) return;
    const $grid = $picker.find('.emoji-grid');
    const q = (filter || $picker.find('.emoji-search').val() || '').toLowerCase();
    $grid.empty();

    const emojiList = buildEmojiList(settings.emojiData);
    const results = emojiList.filter(e => e.search.includes(q)).slice(0, 200);

    results.forEach(e => {
      const $item = $(`<button class="emoji-btn" type="button" style="border:none;background:none;cursor:pointer;padding:2px;">${e.emoji}</button>`);
      $item.attr('title', e.name || e.keywords.join(', '));
      $item.on('click', () => {
        settings.onSelect(e.emoji);
        $picker.hide();
        $currentTrigger = null;
      });
      $grid.append($item);
    });
  }

  function createPicker() {
    $picker = $(`
      <div class="emoji-picker-popup" style="position:absolute;z-index:9999;display:none;width:260px;border:1px solid #ccc;border-radius:6px;box-shadow:0 2px 10px rgba(0,0,0,0.15);background:var(--desktop_element-background);">
        <input type="text" class="emoji-search" placeholder="Search..." style="width:100%;padding:6px;border:none;border-bottom:1px solid #eee;box-sizing:border-box;" />
        <div class="emoji-grid" style="max-height:200px;min-height:200px;overflow-y:auto;padding:6px;display:flex;flex-wrap:wrap;align-items:start;gap:6px;font-size:20px;"></div>
      </div>
    `);

    $picker.on('click', ev => ev.stopPropagation());
    $picker.find('.emoji-search').on('input', () => {
      if ($currentTrigger) {
        const settings = $currentTrigger.data('emojiPicker-settings');
        renderPicker(settings);
      }
    });

    $('body').append($picker);

    if (!docHandlerAttached) {
      $(document).off('click.emojiPickerGlobal').on('click.emojiPickerGlobal', e => {
        if (!$picker) return;
        if (!$(e.target).closest('.emoji-picker-popup').length &&
            !($currentTrigger && ($currentTrigger.is(e.target) || $.contains($currentTrigger[0], e.target)))) {
          $picker.hide();
          $currentTrigger = null;
        }
      });
      docHandlerAttached = true;
    }

    return $picker;
  }

  function showPicker($trigger) {
    const settings = $trigger.data('emojiPicker-settings');
    if (!$picker) createPicker();

    if ($currentTrigger && $currentTrigger[0] === $trigger[0]) {
      if ($picker.is(':visible')) {
        $picker.hide();
        $currentTrigger = null;
        return;
      }
    }

    $currentTrigger = $trigger;

    $picker.css({ left: -9999, top: -9999, display: 'block' });
    renderPicker(settings);

    const offset = $trigger.offset();
    const triggerHeight = $trigger.outerHeight();
    const pickerHeight = $picker.outerHeight();

    const left = offset.left;
    const top = offset.top - pickerHeight - 8;

    $picker.css({
      left,
      top: top < 0 ? (offset.top + triggerHeight + 8) : top,
      display: 'block'
    });

    $picker.find('.emoji-search').focus();
  }

  $.fn.emojiPicker = function (optionsOrCommand) {
    if (typeof optionsOrCommand === 'string') {
      const cmd = optionsOrCommand;
      if (cmd === 'hide') { if ($picker) $picker.hide(); $currentTrigger = null; return this; }
      if (cmd === 'destroy') { if ($picker) { $picker.remove(); $picker=null; $currentTrigger=null; $(document).off('click.emojiPickerGlobal'); docHandlerAttached=false; } return this; }
      if (cmd === 'show' || cmd === 'toggle') {
        return this.each(function () { showPicker($(this)); });
      }
      return this;
    }

    const settings = $.extend(true, {}, DEFAULTS, optionsOrCommand || {});

    return this.each(function () {
      const $trigger = $(this);
      $trigger.data('emojiPicker-settings', settings);

      $trigger.off('click.emojiPicker').on('click.emojiPicker', function (ev) {
        ev.stopPropagation();
        showPicker($trigger);
      });

      if (settings.autoShow) {
        showPicker($trigger);
      }
    });
  };
}


}