export default function flood(duration = 5000, intensity = 3) {
    // Prevent multiple floods
    if ($('body').hasClass('flood-active')) return;

    const $body = $('body').addClass('flood-active');

    // Inject CSS
    const $style = $('<style>').text(`
        .flood-wrapper {
            position: fixed;
            inset: 0;              /* top/right/bottom/left: 0 */
            width: 100vw;
            height: 100vh;
            z-index: 100001;
            pointer-events: none;  /* do not block clicks */
            overflow: hidden;
        }
        .water {
            position: absolute;
            left: 0;
            bottom: 0;
            width: 100%;
            height: 0vh; /* start at bottom */
            background: linear-gradient(to top, rgba(0, 100, 200, 0.9), rgba(0, 150, 255, 0.7));
            transition: height var(--flood-duration, 5000ms) ease-in;
        }
        .water.water-wave::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 20px;
            background: linear-gradient(to top, rgba(255, 255, 255, 0.4), transparent);
            animation: wave 1.5s infinite;
        }
        @keyframes wave {
            0%   { transform: translateX(0)    skew(0deg); }
            50%  { transform: translateX(-10%) skew(5deg); }
            100% { transform: translateX(0)    skew(0deg); }
        }
        @keyframes bubble {
            0%   { transform: translateY(0);      opacity: 0.3; }
            100% { transform: translateY(-100vh); opacity: 0;   }
        }
        .water-rise { height: 100vh !important; } /* fill the viewport */
    `).appendTo('head');

    // Fixed, full-viewport wrapper we can safely "shake"
    const $wrapper = $('<div class="flood-wrapper">').appendTo(document.body);

    // Water layer inside the wrapper
    const $water = $('<div class="water water-wave">')
        .css({ '--flood-duration': `${duration}ms` })
        .appendTo($wrapper);

    // Lock scroll without transforming <body>
    const $html = $('html');
    const prevHtmlOverflow = $html.css('overflow');
    const prevBodyOverflow = $body.css('overflow');
    $html.css('overflow', 'hidden');
    $body.css('overflow', 'hidden');

    // Sound
    try {
        this.bp.play('v5/apps/based/spellbook/spells/flood/flood.mp3', { duration: duration + 3000 });
    } catch (e) {
        const audio = new Audio('v5/apps/based/spellbook/spells/flood/flood.mp3');
        audio.play().catch(err => console.warn('Audio playback failed:', err));
    }

    // Bubbles
    const bubbleCount = 10;
    const bubbles = [];
    for (let i = 0; i < bubbleCount; i++) {
        const $bubble = $('<div>').css({
            position: 'absolute',
            bottom: '5%',
            left: `${Math.random() * 90 + 5}%`,
            width: `${Math.random() * 20 + 10}px`,
            height: `${Math.random() * 20 + 10}px`,
            background: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '50%',
            pointerEvents: 'none',
            zIndex: 100002,
            animation: `bubble ${Math.random() * 2000 + 1000}ms linear infinite`
        }).appendTo($water);
        bubbles.push($bubble);
    }

    // Start the rise (small delay so transition applies)
    setTimeout(() => $water.addClass('water-rise'), 50);

    // Shake the wrapper (NOT the body)
    const frameRate = 1000 / 60;
    const startTime = Date.now();

    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        if (elapsed < duration) {
            const shake = intensity * (1 - progress);
            const ox = (Math.random() - 0.5) * shake * 2;
            const oy = (Math.random() - 0.5) * shake * 2;
            $wrapper.css('transform', `translate(${ox}px, ${oy}px)`);
            setTimeout(animate, frameRate);
        } else {
            // Hold the flood briefly, then clean up
            setTimeout(() => {
                $wrapper.remove();
                $style.remove();
                $html.css('overflow', prevHtmlOverflow);
                $body.css('overflow', prevBodyOverflow).removeClass('flood-active');
            }, 3000); // hold time
        }
    }

    animate();
}
