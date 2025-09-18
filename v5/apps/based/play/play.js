// Buddy Pond - Play.js - Marak Squires 2024
import AudioNode from './AudioNode.js';

export default class Play {
    // Map to track playing files and avoid concurrent plays
    static playing = new Map();

    constructor(bp, options = {}) {
        this.bp = bp;
        this.settings = { ...options };
    }

    async init () {
        this.bp.play = this.play.bind(this);
    }

    async play(mediaPath, {
        tryHard = 0,
        repeat = false,
        duration = 999999, onEnd = () => {}, onError = () => {} } = {}) {
        if (this.bp.settings.audio_enabled === false) {
            return;
        }
    
        // Check if media is already playing and if retries are not allowed
        if (Play.playing.get(mediaPath) && !tryHard) {
            // console.log(`Warning: Already playing ${mediaPath}. Will not play the same media file concurrently.`);
            return;
        }
    
        // check if mediaPath starts with http, if not prepend the host
        if (!mediaPath.startsWith('http')) {
            mediaPath = this.bp.config.host + '/' + mediaPath;
        }

        // Mark the media as playing
        Play.playing.set(mediaPath, true);
    
        const media = new Audio(mediaPath);
        let currentVolume = this.bp.get('audio_volume');
        // ensure that currentVolume is a number, if not default to 1
        if (typeof currentVolume !== 'number' || isNaN(currentVolume)) {
            currentVolume = 1.0;
        }

        // TODO: Would probably be better to have a single AudioNode for the play.js app, instead of one per play() call
        const audioNode = new AudioNode(media, currentVolume);

        this.bp.on('settings::audio_volume', 'update-playing-volume', function(volume){
            console.log('Updating playing volume to', volume);
            audioNode.setVolume(volume);
        });

        let stopTimeout;
        let forceStop = false;
    
        const cleanup = () => {
            clearTimeout(stopTimeout);
            media.pause();
            media.currentTime = 0;
            media.loop = false;
            forceStop = true;
            Play.playing.delete(mediaPath);
            // remove the event listener
            this.bp.off('settings::audio_volume', 'update-playing-volume');
            audioNode.disconnect();
        };
    
        const stopAtDuration = () => {
            stopTimeout = setTimeout(() => {
                cleanup();
                onEnd();
            }, duration);
        };
    
        media.addEventListener('ended', () => {
            if (!repeat || forceStop) {
                cleanup();
                onEnd();
            }
            // If repeating, do nothing — allow media.loop to handle replay
        });
    
        media.addEventListener('error', (err) => {
            cleanup();
            onError(err);
        });
    
        try {
            // Handle repeat logic
            if (repeat) {
                media.loop = true;
            }
    
            await media.play();
            stopAtDuration();
        } catch (error) {
            cleanup();
            onError(error);
        }
    }
    
    
}
