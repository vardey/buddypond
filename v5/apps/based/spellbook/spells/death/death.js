export default function skullFlash({
    duration = 15000, // Duration of the effect (ms)
    soundUrl = 'v5/apps/based/spellbook/spells/death/death.mp3', // Path to MP3
    skullSize = 200, // Size of skull emoji (px)
    rotationAngle = 15, // Max rotation angle (degrees)
    textDelay = 6000 // Delay before text appears (ms)
} = {}) {
    // Prevent multiple skull flash effects
    if ($('body').hasClass('skull-flash-active')) return;

    const $body = $('body');
    $body.addClass('skull-flash-active');

    // Inject CSS
    const $style = $('<style>').text(`
        .skull-overlay {
            position: fixed;
            inset: 0; /* top:0; right:0; bottom:0; left:0 */
            width: 100vw;
            height: 100vh;
            background: black;
            z-index: 100001;
            pointer-events: none;
        }
        .skull-emoji {
            position: fixed;
            left: 50vw;
            top: 50vh;
            font-size: ${skullSize}px;
            color: white;
            z-index: 100001;
            pointer-events: none;
            animation: skullRotate 2s ease-in-out infinite;
            transform: translate(-50%, -50%);
        }
        @keyframes skullRotate {
            0% { transform: translate(-50%, -50%) rotate(-${rotationAngle}deg); }
            50% { transform: translate(-50%, -50%) rotate(${rotationAngle}deg); }
            100% { transform: translate(-50%, -50%) rotate(-${rotationAngle}deg); }
        }
        .death-text {
            position: fixed;
            left: 50vw;
            top: 50vh;
            transform: translate(-50%, -50%);
            color: red;
            font-size: 100px;
            font-family: 'Arial', sans-serif;
            font-weight: bold;
            text-align: center;
            z-index: 100002;
            pointer-events: none;
            opacity: 0;
            animation: fadeIn 1s ease-in forwards ${textDelay}ms;
        }
        @keyframes fadeIn {
            0% { opacity: 0; }
            100% { opacity: 1; }
        }
    `).appendTo('head');

    // Create overlay
    const $overlay = $('<div>').addClass('skull-overlay').appendTo($body);

    // Create skull emoji
    const $skull = $('<span>').addClass('skull-emoji').text('💀').appendTo($body);

    // Create death text
    const $text = $('<div>').addClass('death-text').text('YOU HAVE DIED').appendTo($body);

    // Prevent page scrolling while active
    const prevOverflow = $body.css('overflow');
    $body.css('overflow', 'hidden');

    // Play sound
    try {
        this.bp.play(soundUrl, { tryHard: 1, volume: 0.5 });
    } catch (e) {
        const audio = new Audio(soundUrl);
        audio.volume = 0.5;
        audio.play().catch(err => console.warn('Audio playback failed:', err));
    }

    // Cleanup
    setTimeout(() => {
        $overlay.remove();
        $skull.remove();
        $text.remove();
        $style.remove();
        $body.removeClass('skull-flash-active');
        $body.css('overflow', prevOverflow); // restore scroll
    }, duration);
}
