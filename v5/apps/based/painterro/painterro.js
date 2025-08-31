export default class Painterro {
  constructor(bp, options = {}) {
    this.bp = bp;
    this.options = options;
    return this;
  }

  async init() {
    return 'loaded Painterro';
  }

  async open(options = {}) {

    if (options.src) {
      this.src = options.src;
    }

    if (options.output) {
      this.output = options.output;
    } else {
      this.output = 'localhost';
    }

    if (options.context) {
      this.context = options.context;
    } else {
      this.context = 'file-system';
    }


    this.win = this.bp.window(this.window());
    return this.win;
  }


  broadcastChannel() {


    this.receiver = new BroadcastChannel("buddypond-painterro");
    // creates a new BroadcastChannel for the desktop
    this.bc = new BroadcastChannel("buddypond-desktop");
    // Listen for messages on the desktop channel
    this.bc.onmessage = async (event) => {
      // console.log('BroadcastChannel message received:', event.data);
      let app = event.data.app;

      // console.log(`received message from app: ${app}`);

      if (event.data.app === 'painterro' && event.data.action === 'save') {
        console.log('BroadcastChannel save action received', event.data);

        let dataURL = event.data.image; // Remark: this was sent over a broadcast channel
        // console.log('Data URL received:', dataURL);
        let fileName = event.data.fileName || buddypond.generateSafeFilename('png');
        let filePath = `paints/${fileName}`;

        function srcToFile(src, fileName, mimeType) {
          return (fetch(src)
            .then(function (res) { return res.arrayBuffer(); })
            .then(function (buf) { return new File([buf], fileName, { type: mimeType }); })
          );
        }

        srcToFile(dataURL, fileName, 'image/png').then(async (file) => {

          // Create File from Blob
          //const file = new File([blob], fileName, { type: blob.type });
          file.filePath = filePath;
          console.log('File created:', file, file instanceof File);

          // Test image display
          const testImage = document.createElement('img');

          // if we have no context or output, save the file locally
          if (!this.context || !this.output) {
            console.warn('No context or output specified, saving file locally.');
            // Save the file locally
            let link = document.createElement('a');
            link.href = URL.createObjectURL(file);
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            return;
          }

          let onProgress = (progress) => {
            console.log(`Upload progress: ${progress}%`);
          };

          // ✅ Upload via buddypond API
          try {
            let resultingUrl = await buddypond.uploadFile(file, onProgress);
            console.log('Upload successful:', resultingUrl);
            let message = {
              to: this.context,
              from: bp.me,
              type: this.output,
              text: resultingUrl
            };
            console.log("sending multimedia message", message);
            bp.emit('buddy::sendMessage', message);
            // now take this image and send it to the chat window as url message
            this.close();
          } catch (err) {
            console.error('Upload failed:', err);
          }
        });
      }

    }
  }

  window() {
    return {
      id: 'painterro',
      title: 'Painterro',
      icon: 'desktop/assets/images/icons/icon_painterro_64.png',
      x: 250,
      y: 75,
      width: 800,
      height: 400,
      parent: $('#desktop')[0],
      iframeContent: '/v5/apps/based/painterro/vendor/painterro.html?context=' + this.context + '&output=' + this.output,
      resizable: true,
      minimizable: true,
      maximizable: true,
      closable: true,
      focusable: true,
      maximized: false,
      minimized: false,
      onLoad: () => {
        if (this.src) {
          // send message to broadcast channel to load this image
          console.log('requesting painterro to load image', this.src);
          this.receiver.postMessage({ type: "app", app: "painterro", action: "load", src: this.src });
        }
      },
      onOpen: () => {
        this.broadcastChannel();
      },
      onClose: () => {
      }
    }
  }

  close() {
    if (this.win) {
      this.win.close();
      this.win = null;
    }
    // cleanup broadcast channel
    if (this.bc) {
      this.bc.close();
      this.bc = null;
    }
    if (this.receiver) {
      this.receiver.close();
      this.receiver = null;
    } 
  }

}