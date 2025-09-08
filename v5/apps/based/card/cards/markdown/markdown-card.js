export default function applyData(el, data, cardClass, parent) {
    let $el = $(el);
    $el.find('.card-md-close-btn').on('click', () => {
        $el.hide(); // Hide the help card (replace with your preferred close logic)
        // set local storage 'viewed-help-card' to true
    });
    if (cardClass.bp && cardClass.bp.apps && cardClass.bp.apps.buddylist) {
      cardClass.bp.apps.buddylist.scrollToBottom(parent.content);
    }
}