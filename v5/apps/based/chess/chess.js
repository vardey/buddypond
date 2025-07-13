// TODO: add sound via https://github.com/lichess-org/lila/tree/master/public/sound
// TODO: move joinGame() and handleWebsocketMessage() to separate files
export default class ChessApp {
    constructor(bp, options = {}) {
        this.bp = bp;
        this.options = options;
        this.board = null;
        this.game = null;
        this.ws = null;
        this.playerColor = null;
        this.stockfish = null;
        this.difficulty = 10; // Default difficulty (0-20 scale)

        this.mode = 'multiplayer';
    }

    async init() {
        this.html = await this.bp.load('/v5/apps/based/chess/chess.html');
        await this.bp.appendCSS('/v5/apps/based/chess/chess.css');

        await this.bp.appendScript('/v5/apps/based/chess/vendor/chessboardjs-1.0.0/js/chessboard-1.0.0.js');
        // await this.bp.appendScript('https://unpkg.com/@chrisoakman/chessboardjs@1.0.0/dist/chessboard-1.0.0.js');

        await this.bp.appendScript('/v5/apps/based/chess/vendor/chess.js');
        //await this.bp.appendScript('https://cdnjs.cloudflare.com/ajax/libs/chess.js/0.10.3/chess.js');

        await this.bp.appendCSS('/v5/apps/based/chess/vendor/chessboardjs-1.0.0/css/chessboard-1.0.0.min.css', false, true);
        //await this.bp.appendCSS('https://unpkg.com/@chrisoakman/chessboardjs@1.0.0/dist/chessboard-1.0.0.min.css');
        return 'loaded ChessApp';
    }

    async open(config = {}) {

        if (this.win) {
            return this.win;
        }
        this.win = await this.bp.window(this.window());
        // this.win = this.bp.apps.ui.windowManager.createWindow(this.window());
        console.log('Opening ChessApp window:', this.win);
        this.bindUI();

        // Add difficulty slider to the DOM
        this.setupDifficultySlider();

        if (config.gameId) {
            // join and start the game
            this.gameId = config.gameId;
            this.joinGame(config.gameId);
            let parts = this.gameId.split('/');
            console.log('Parts:', parts);
            this.opponent = parts[0];
            if (this.opponent === this.bp.me) {
                this.opponent = parts[1];
            }
        }

        //alert(this.win)
        return this.win;
    }

    window() {
        return {
            id: 'chess',
            title: 'BuddyPond Chess',
            icon: 'desktop/assets/images/icons/icon_chess_64.png',
            x: 120,
            y: 80,
            parent: $('#desktop')[0],
            width: 850,
            height: 600,
            content: this.html,
            resizable: true,
            closable: true,
            onClose: () => {
                this.cleanup();
                this.win = null;
            },
            onResize: () => {
                if (this.board) {
                    this.board.resize();
                }
            }
        }
    }

    bindUI() {
        const $mode = $('.chess-app-mode-selection');
        const $join = $('.chess-app-join-ui');
        const $game = $('.chess-app-game-ui');

        // Handle "Play Against Computer"
        $('#play-stockfish').on('click', () => {
            this.mode = 'stockfish';
            $mode.hide();
            $game.show();
            $('#opponent-name').text('Opponent: Stockfish');
            this.startStockfishGame();
        });

        // Handle "Play with a Buddy" → Show input
        $('#show-join-game').on('click', () => {
            if (!this.bp.me || this.bp.me === 'Guest') {
                alert('Please log in to play with a buddy. ' + this.bp.me);
                this.bp.open('buddylist');
                return;
            }

            $mode.hide();
            $join.show();
        });

        // Handle "Join Game" after buddy enters ID
        $('#join-game').on('click', async () => {

            // get the chess-game-buddyname value
            let buddyname = $('#chess-game-buddyname').val().trim();
            if (!buddyname) {
                alert('Please enter a Buddy Name');
                return;
            }
            let me = this.bp.me;

            if (buddyname === me) {
                alert('You cannot play against yourself. Please enter a different Buddy Name.');
                return;
            }
            // combine buddyname and me into string separated by /, sorted alphabetically
            let gameId = [buddyname, me].sort().join('/');
            console.log('Game ID: ' + gameId);
            // if (!gameId) return alert('Please enter a Game ID');
            this.opponent = buddyname;
            $('#game-input').val(gameId);
            this.mode = 'multiplayer';
            $join.hide();
            $game.show();
            // $('#opponent-name').text(`Waiting for ${buddyname} to connect`);
            this.setStatus(`Waiting for ${buddyname} to connect`);
            // alert('send')

            console.log('gameId', gameId)
            // if (data.chatId === 'buddy/' + gameId) {
            // should send message to buddy that will open the videocall window on receiving end
            this.sendGameInvite(buddyname);
            this.joinGame(document.getElementById('game-input').value.trim());

        });

        // Leave Game
        $('#leave-button').on('click', () => {
            this.cleanup();
            this.resetUI();
        });

        // Resign Game
        $('#resign-button').on('click', () => {
            if (this.mode === 'multiplayer') {
                this.ws?.send(JSON.stringify({ type: 'resign' }));
            }
            this.setStatus('You resigned the game.');
            this.gameHeader('Resigned');
        });

        // Restart Game (single-player only)
        $('#restart-button').on('click', () => {
            if (this.mode === 'stockfish') {
                this.startStockfishGame();
            }
        });


        // Init game logic + board
        this.game = new Chess();

        //$('#chessboard', this.win.content)[0]

        const board = $('#chessboard', this.win.content);
        this.board = Chessboard(board, {
            pieceTheme: '/v5/apps/based/chess/img/chesspieces/wikipedia/{piece}.png',
            draggable: true,
            position: 'start',
            onDragStart: this.onDragStart.bind(this),
            onDrop: this.onDrop.bind(this),
            onSnapEnd: this.onSnapEnd.bind(this)
        });
        // this.board.resize();
        // get the width of the board container
        const boardWidth = $('.chess-app-game-row', this.win.content).width();
        //alert('Board width: ' + boardWidth);
        // set the board size to be 90% of the container width
        // board.css({ width: `${Math.floor(boardWidth * 0.9)}px` });
        if (this.bp.isMobile()) {
            $('.chess-app-board', this.win.content).css({ width: 'calc(var(--vw) * 0.95)' });
        } else {
            // $('.chess-app-board', this.win.content).css({ height: 'calc(var(--vh) * 1)'});

        }
        this.board.resize();
        // $('.chess-app-board', this.win.content).width(Math.floor(boardWidth * 0.9));

        this.updateStatus();
    }

    sendGameInvite(buddyname) {

        let message = {
            from: bp.me,
            to: buddyname,
            text: 'Let\'s play a chess game',
            type: 'buddy',
            card: {
                type: 'chess'
            }
        }
        console.log('Buddy Chess message', message);
        // send message to buddy
        buddypond.sendCardMessage(message, function (err, response) {
            if (err) {
                console.error('Error sending message', err);
            } else {
                console.log('Message sent', response);
            }
        });

    }

    setupDifficultySlider() {
        const sliderContainer = document.createElement('div');
        sliderContainer.className = 'chess-app-difficulty-slider';
        sliderContainer.innerHTML = `
      <label for="difficulty">Difficulty: <span id="difficultyValue">${this.difficulty}</span></label>
      <input type="range" id="difficulty" min="0" max="20" value="${this.difficulty}" step="1">
    `;
        //document.body.appendChild(sliderContainer); // Adjust to append where needed
        $('.chess-app-controls', this.win.content).append(sliderContainer);

        const slider = document.getElementById('difficulty');
        const difficultyValue = document.getElementById('difficultyValue');

        slider.addEventListener('input', (e) => {
            this.difficulty = parseInt(e.target.value, 10);
            difficultyValue.textContent = this.difficulty;
            // Update Stockfish difficulty if game is active
            if (this.stockfish) {
                this.setStockfishDifficulty();
            }
        });
    }

    // Set Stockfish difficulty by sending UCI commands
    setStockfishDifficulty() {
        // Map difficulty (0-20) to Stockfish Skill Level (0-20)
        this.stockfish.postMessage(`setoption name Skill Level value ${this.difficulty}`);
        // Optionally limit depth for lower difficulty to make Stockfish respond faster
        const maxDepth = Math.max(1, Math.floor(this.difficulty / 2) + 1); // Depth 1-11
        this.stockfish.postMessage(`setoption name Skill Level Maximum Depth value ${maxDepth}`);
    }

    // TODO: allow custom difficulty for stockfish
    startStockfishGame() {
        $('.chess-app-difficulty-slider', this.win.content).show();
        this.game.reset();
        this.board.position('start');
        this.playerColor = 'w';
        this.setStatus('You are White. Make your move.');
        this.stockfish = new Worker('v5/apps/based/chess/vendor/stockfish.min.js');
        this.stockfish.onmessage = (e) => {
            if (typeof e.data === 'string' && e.data.startsWith('bestmove')) {
                const move = e.data.split(' ')[1];
                const from = move.substring(0, 2);
                const to = move.substring(2, 4);
                const result = this.game.move({ from, to, promotion: 'q' });
                if (result) {
                    this.board.position(this.game.fen());
                    this.updateStatus();
                }
            }
        };

        // Initialize Stockfish with UCI commands
        this.stockfish.postMessage('uci');
        this.stockfish.postMessage('isready');
        this.setStockfishDifficulty(); // Set initial difficulty

    }

    async joinGame(gameId) {
        if (!gameId) return alert('Please enter a game ID');
        const $mode = $('.chess-app-mode-selection');
        const $join = $('.chess-app-join-ui');
        const $game = $('.chess-app-game-ui');

        // hide the `restart-button` button
        this.mode = 'multiplayer';
        $join.hide();
        $game.show();
        $mode.hide();

        $('#restart-button', this.win.content).hide();
        $('.chess-app-difficulty-slider', this.win.content).hide();

        const endpoint = `${buddypond.chessWsEndpoint}?me=${buddypond.me}&qtokenid=${buddypond.qtokenid}gameId=${encodeURIComponent(gameId)}`;
        console.log('Connecting to game server at:', endpoint);
        this.ws = new WebSocket(endpoint);

        this.ws.onopen = () => {
            //alert('Connected to game server');
            this.ws.send(JSON.stringify({ type: 'join', gameId }));
            this.ws.send(JSON.stringify({ type: 'getState' }));
            this.setStatus('Connected! Waiting for opponent...');
        };

        this.ws.onmessage = (event) => this.handleSocketMessage(event);
        this.ws.onclose = () => this.setStatus('Disconnected from game');
        this.ws.onerror = () => this.setStatus('WebSocket error occurred');
    }

    async resignGame() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type: 'resign' }));
            this.setStatus('You resigned the game.');
            // this.gameHeader('Resigned');
        } else {
            this.setStatus('Cannot resign, not connected to a game.');
        }
    }

    handleSocketMessage(event) {
        const data = JSON.parse(event.data);
        console.log('handleSocketMessage', event.data)
        switch (data.type) {
            case 'color':
                this.playerColor = data.color;
                this.board.orientation(this.playerColor === 'w' ? 'white' : 'black');
                this.setStatus(
                    `You are ${this.playerColor === 'w' ? 'White' : 'Black'}. ` +
                    `${this.game.turn() === 'w' ? 'White' : 'Black'} to move.`
                );
                break;

            case 'gameStart':
                this.gameConnected = true;
                this.setStatus('Game started! ' + (this.playerColor === this.game.turn() ? 'Your move' : this.opponent + "'s move"));

                // $('.chess-app-opponent', this.win.content).html(`${this.opponent} is connected!`);
                break;

            case 'gameState':
                this.game.load(data.fen);
                this.board.position(this.game.fen());
                this.updateStatus();
                break;

            case 'move':
                const move = this.game.move(data.move);
                if (move) {
                    this.board.position(this.game.fen());
                    this.updateStatus();
                }
                break;

            case 'gameReset':
                this.game.reset();
                this.board.start();
                this.gameConnected = true;
                // this.playerColor = null;
                this.setStatus('Game started! ' + (this.playerColor === this.game.turn() ? 'Your move' : "Opponent's move"));
                $('#rematch-button', this.win.content).hide();
                break;

            case 'gameOver':
                this.setStatus('Game Over: ' + data.result);

                // show the rematch button if multiplayer
                if (this.mode === 'multiplayer') {
                    $('#rematch-button', this.win.content).show();
                    $('#rematch-button', this.win.content).on('click', () => {
                        this.ws.send(JSON.stringify({ type: 'rematch' }));
                        this.setStatus(`Rematch requested. Waiting for ${this.opponent}...`);
                    });
                }
                break;

            case 'error':
                this.setStatus('Error: ' + data.message);
                break;
            case 'disconnect':
                this.gameConnected = false;
                this.setStatus(this.opponent + ' has disconnected...');
                break;

            default:
                console.warn('Unknown socket message:', data);
                break;
        }
    }

    onDragStart(source, piece) {
        if (this.game.game_over()) return false;
        if (this.mode === 'multiplayer') {
            if (this.playerColor && piece[0] !== this.playerColor) return false;
            if (this.game.turn() !== this.playerColor) return false;
        } else if (this.mode === 'stockfish') {
            if (this.game.turn() !== 'w') return false;
        }
        return true;
    }

    onDrop(source, target) {
        let move;
        try {
            move = this.game.move({ from: source, to: target, promotion: 'q' });
            if (move === null) return 'snapback';

        } catch (err) {
            return 'snapback';
        }

        if (this.mode === 'multiplayer' && this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                type: 'move',
                gameId: document.getElementById('game-input').value,
                move: { from: source, to: target, promotion: 'q' }
            }));
        } else if (this.mode === 'stockfish') {
            setTimeout(() => {
                this.stockfish.postMessage('position fen ' + this.game.fen());
                this.stockfish.postMessage('go depth 15');
            }, 200);
        }

        this.updateStatus();
    }

    onSnapEnd() {
        this.board.position(this.game.fen());
    }

    updateStatus() {
        let status = '';
        if (this.game.in_checkmate()) {
            status = 'Checkmate! ' + (this.game.turn() === 'w' ? 'Black' : 'White') + ' wins!';
        } else if (this.game.in_draw()) {
            status = 'Game Over: Draw!';
        } else {

            if (this.gameConnected) {
                status = (this.game.turn() === 'w' ? 'White' : 'Black') + ' to move';

            } else {
                status = `Waiting for ${this.opponent} to connect...`;
            }
        }
        this.setStatus(status);
    }

    setStatus(message) {
        $('.chess-app-status', this.win.content).text(message);
        // document.getElementById('status').textContent = message;
    }

    resetUI() {
        $('.chess-app-mode-selection', this.win.content).show();
        $('.chess-app-join-ui', this.win.content).hide();
        $('.chess-app-game-ui', this.win.content).hide();
        $('#opponent-name', this.win.content).text('Opponent: ');
        $('#rematch-button', this.win.content).hide();
        this.setStatus('Welcome to BuddyPond Chess!');
        if (this.board) {
            this.board.clear();
            this.board.start();
        }
        this.game = new Chess();
        this.playerColor = null;
        if (this.stockfish) {
            this.stockfish.terminate();
            this.stockfish = null;
        }
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    cleanup() {
        if (this.ws) this.ws.close();
        if (this.stockfish) {
            this.stockfish.terminate();
            this.stockfish = null;
        }
    }
}