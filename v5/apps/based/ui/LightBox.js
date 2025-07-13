export default function showLightbox(src) {
  // Remove any existing overlay
  $('.buddypond-lightbox-overlay').remove();

  const $overlay = $(`
    <div class="buddypond-lightbox-overlay" style="
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.85);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 999999;
      cursor: zoom-out;
      display: none;
    "></div>
  `);

  const $img = $('<img style="max-width: 90%; max-height: 90%; box-shadow: 0 0 10px #000;">');
  $img.attr('src', src);
  $overlay.append($img);
  $('body').append($overlay);
  this.bp.ignoreUIControlKeys = true;

  // Show with fade-in
  $overlay.flexShow().fadeIn(150);

  // ESC key handler
  const onKeyUp = (e) => {
    if (e.key === 'Escape') {
      closeOverlay.call(this);
    }
  };

  // Close function with fade-out
  function closeOverlay() {
    $(document).off('keyup', onKeyUp); // cleanup key event
    this.bp.ignoreUIControlKeys = false;

    $overlay.fadeOut(150, () => $overlay.remove());
  }

  // Click to close
  $overlay.on('click', closeOverlay);
  $(document).on('keyup', onKeyUp);
}
