export default function lightning(duration = 5000, boltCount = 5, intensity = 3) {
    if ($('body').hasClass('lightning-active')) return;

    const $body = $('body').addClass('lightning-active');

    // Fixed full-viewport wrapper (safe to shake)
    const $wrapper = $('<div class="lightning-wrapper">').css({
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 100001,
        pointerEvents: 'none',
        overflow: 'hidden'
    }).appendTo(document.body);

    // Flash overlay
    const $flash = $('<div>').css({
        position: 'absolute',
        inset: 0,
        background: 'rgba(255, 255, 255, 0)',
        pointerEvents: 'none',
        zIndex: 100002
    }).appendTo($wrapper);

    // Lightning bolts
    const bolts = [];
    for (let i = 0; i < boltCount; i++) {
        const $bolt = $('<img>')
            .attr('src', '/v5/apps/based/spellbook/spells/lightning-bolt.webp')
            .css({
                position: 'absolute',
                top: '-20%',   // start above viewport
                left: `${Math.random() * 90}%`, // random x
                width: '10%',
                opacity: 0,
                pointerEvents: 'none',
                zIndex: 100003
            })
            .appendTo($wrapper);

        bolts.push($bolt);

        // Alternate thunder sounds
        if (i % 2 === 0) {
            this.bp.play('v5/apps/based/spellbook/spells/lightning/thunder1.mp3', { tryHard: 1 });
        } else {
            this.bp.play('v5/apps/based/spellbook/spells/lightning/thunder2.mp3', { tryHard: 1 });
        }
    }

    // Animation loop
    const frameRate = 1000 / 60;
    const startTime = Date.now();

    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;

        if (elapsed < duration) {
            // Flash effect
            if (Math.random() > 0.9) {
                $flash.css('background', 'rgba(255, 255, 255, 0.8)');
                setTimeout(() => $flash.css('background', 'rgba(255, 255, 255, 0)'), 100);
            }

            // Animate bolts
            bolts.forEach(($bolt, i) => {
                const boltProgress = (progress + i / boltCount) % 1;
                const yPos = -20 + boltProgress * 140; // move through viewport
                const opacity = Math.sin(boltProgress * Math.PI);
                $bolt.css({
                    top: `${yPos}%`,
                    opacity
                });
            });

            // Shake wrapper
            const shakeIntensity = intensity * (1 - progress);
            const ox = (Math.random() - 0.5) * shakeIntensity * 2;
            const oy = (Math.random() - 0.5) * shakeIntensity * 2;
            $wrapper.css('transform', `translate(${ox}px, ${oy}px)`);

            setTimeout(animate, frameRate);
        } else {
            // Cleanup
            $wrapper.remove();
            $body.removeClass('lightning-active');
        }
    }

    animate();
}
