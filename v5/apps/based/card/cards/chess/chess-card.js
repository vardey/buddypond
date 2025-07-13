export default function applyData(el, data) {
    const $el = $(el);
    console.log('open chess card', data);

    if (data.message.from === this.bp.me) {
        $el.find('.card-chess-header').html('Sent Chess Challenge');
        $el.find('.accept-game').remove();
        $el.find('.decline-game').remove();

        $el.find('.open-game').click(async () => {
            // opens chess app with gameId context, auto-connects
            let win = await this.bp.open('chess', {
                gameId: data.message.chatId.replace('buddy/', '')
            });
            if (!win.isMaximized) {
                win.maximize();
            }
        });
        $el.find('.decline-game').click(() => {
            // opens chess app with gameId context, auto-connects
            // TODO: send message to buddy declining
            /*
            this.bp.open('chess', {
                gameId: data.message.chatId.replace('buddy/', '')
            })
            */
        });

    } else {
        $el.find('.open-game').remove();


        $el.find('.accept-game').click(async () => {
            // opens chess app with gameId context, auto-connects
            let win = await this.bp.open('chess', {
                gameId: data.message.chatId.replace('buddy/', '')
            });
            if (!win.isMaximized) {
                win.maximize();
            }
        });

    }

}