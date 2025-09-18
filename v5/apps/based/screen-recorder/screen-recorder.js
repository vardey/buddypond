export default class ScreenRecorder {
    constructor(bp, options = {}) {
        this.bp = bp;
        this.options = options;
        this.recorder = null;
        this.recordedChunks = [];
        this.stream = null;
        this.videoBlob = null;
        this.videoURL = null;
        this.timerInterval = null;
        this.secondsElapsed = 0;
    }

    async init() {
        this.html = await this.bp.load('/v5/apps/based/screen-recorder/screen-recorder.html');
        await this.bp.load('/v5/apps/based/screen-recorder/screen-recorder.css');
        return 'loaded ScreenRecorder';
    }

    async open() {
        this.win = this.bp.apps.ui.windowManager.createWindow({
            id: 'screen-recorder',
            title: 'Screen Recorder',
            icon: 'desktop/assets/images/icons/icon_console_64.webp',
            x: 100,
            y: 75,
            width: 600,
            height: 550,
            minWidth: 400,
            minHeight: 300,
            parent: $('#desktop')[0],
            content: this.html,
            resizable: true,
            minimizable: true,
            maximizable: true,
            closable: true,
            focusable: true,
            maximized: false,
            minimized: false,
            onClose: () => this.cleanup()
        });

        this.bindUI();

        this.startPreview();
        return this.win;
    }

    bindUI() {
        // use this jQuery pattern $('#screen-recorder-start', this.win.content) to bind events
        $('#screen-recorder-start', this.win.content).on('click', () => this.startRecording());
        // $('#screen-recorder-preview', this.win.content).on('click', () => this.startPreview());
        // $('#screen-recorder-preview-stop', this.win.content).on('click', () => this.stopPreview());
        $('#screen-recorder-stop', this.win.content).on('click', () => this.stopRecording());
        $('#screen-recorder-download', this.win.content).on('click', () => this.downloadRecording());
        $('#screen-recorder-screenshot', this.win.content).on('click', () => this.takeScreenshot());
    }

    async startPreview() {
        try {
            if (!this.stream) {
                this.stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });

                const liveVideo = document.getElementById('screen-recorder-live-video');
                liveVideo.srcObject = this.stream;
                liveVideo.play();

            }
        } catch (err) {
            console.error('Error starting screen preview:', err);
        }
    }

    stopPreview() {
        const liveVideo = document.getElementById('screen-recorder-live-video');
        liveVideo.pause();
        liveVideo.srcObject = null;

        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }

    }

    startRecording() {
        if (!this.stream) {
            console.warn('Stream not initialized. Please start preview first.');
            return;
        }

        this.recordedChunks = [];
        this.videoBlob = null;
        this.videoURL = null;

        this.recorder = new MediaRecorder(this.stream);
        this.recorder.ondataavailable = (e) => {
            if (e.data.size > 0) this.recordedChunks.push(e.data);
        };

        this.recorder.onstop = () => {
            this.generatePreview();
            this.stopTimer();
        };

        this.recorder.start();
        this.startTimer();
        this.toggleRecordingUI(true);

        console.log('Recording started');

        $('#screen-recorder-start', this.win.content).hide();
        $('#screen-recorder-stop', this.win.content).show();
        $('#screen-recorder-output', this.win.content).hide();

    }

    stopRecording() {
        if (this.recorder && this.recorder.state !== 'inactive') {
            this.recorder.stop();
            console.log('Recording stopped');
            $('#screen-recorder-stop', this.win.content).hide();
            $('#screen-recorder-start', this.win.content).show();
            $('#screen-recorder-output', this.win.content).show();
        }
    }

    generatePreview() {
        this.videoBlob = new Blob(this.recordedChunks, { type: 'video/webm' });
        this.videoURL = URL.createObjectURL(this.videoBlob);

        const container = document.getElementById('screen-recorder-output-video');
        container.innerHTML = '';

        const video = document.createElement('video');
        video.src = this.videoURL;
        video.controls = true;
        video.style.width = '100%';
        container.appendChild(video);
    }

    downloadRecording() {
        if (!this.videoBlob) return;

        const a = document.createElement('a');
        a.href = this.videoURL;
        a.download = `buddypond-screen-${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    async takeScreenshot() {
        try {
            // Prompt user for screen capture if stream doesn't exist
            if (!this.stream) {
                this.stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            }

            const videoTrack = this.stream.getVideoTracks()[0];
            const imageCapture = new ImageCapture(videoTrack);

            const bitmap = await imageCapture.grabFrame();
            const canvas = document.createElement('canvas');
            canvas.width = bitmap.width;
            canvas.height = bitmap.height;
            canvas.getContext('2d').drawImage(bitmap, 0, 0);

            canvas.toBlob(blob => {
                const url = URL.createObjectURL(blob);
                const img = document.createElement('img');
                img.src = url;
                img.alt = 'Screenshot';
                img.className = 'screen-recorder-screenshot';

                const container = document.getElementById('screen-recorder-preview-screenshots');
                container.appendChild(img);
            }, 'image/png');
        } catch (err) {
            console.error('Screenshot error:', err);
        }
    }

    startTimer() {
        const indicator = $('#screen-recorder-indicator', this.win.content);
        const timer = $('#screen-recorder-timer', this.win.content);
        this.secondsElapsed = 0;

        this.timerInterval = setInterval(() => {
            this.secondsElapsed++;
            const min = String(Math.floor(this.secondsElapsed / 60)).padStart(2, '0');
            const sec = String(this.secondsElapsed % 60).padStart(2, '0');
            timer.text(`${min}:${sec}`);
        }, 1000);

        indicator.addClass('recording');
    }

    stopTimer() {
        clearInterval(this.timerInterval);
        $('#screen-recorder-indicator', this.win.content).removeClass('recording');
        $('#screen-recorder-timer', this.win.content).text('00:00');
    }

    toggleRecordingUI(isRecording) {
        // hide screen-recorder-live-preview-video
        $('#screen-recorder-live-preview-video', this.win.content).toggle(isRecording);
        // show screen-recorder-output
        $('#screen-recorder-output', this.win.content).toggle(!isRecording);
    }

    cleanup() {
        this.stopTimer();
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
        this.stream = null;
        this.recorder = null;
        this.recordedChunks = [];
        this.videoBlob = null;
        this.videoURL = null;
        this.win = null;
    }
}
