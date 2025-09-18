export default class AudioNode {
  constructor(audioElement, defaultVolume = 0.0) {
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.audioElement = audioElement;

    // Create MediaElementSource
    this.source = this.audioCtx.createMediaElementSource(audioElement);

    // Default gain node (volume)
    this.gainNode = this.audioCtx.createGain();
    this.gainNode.gain.value = defaultVolume;

    // Keep track of nodes in the chain
    this.nodes = [this.gainNode];

    // Connect initial graph
    this._connectGraph();
  }

  _connectGraph() {

    // Disconnect first to avoid duplicate connections
    // Remark: Probably should add this back?
    // this.source.disconnect();

    // Connect chain: source -> ...nodes -> destination
    let prevNode = this.source;
    this.nodes.forEach(node => {
      prevNode.connect(node);
      prevNode = node;
    });
    prevNode.connect(this.audioCtx.destination);
  }

  addNode(node) {
    this.nodes.push(node);
    this._connectGraph(); // rebuild graph
  }

  removeNode(node) {
    this.nodes = this.nodes.filter(n => n !== node);
    this._connectGraph();
  }

  // --- Volume controls ---
  setVolume(value) {
    this.gainNode.gain.value = value;
  }

  getVolume() {
    return this.gainNode.gain.value;
  }

  // --- Playback controls ---
  play() {
    this.audioCtx.resume();
    this.audioElement.play();
  }

  pause() {
    this.audioElement.pause();
  }

  disconnect() {
    this.source.disconnect();
    this.nodes.forEach(node => node.disconnect());
    this.audioCtx.close();
  }

  printGraph() {
    console.log('Audio Graph:');
    console.log('Source -> ' + this.nodes.map(n => n.constructor.name).join(' -> ') + ' -> Destination');
  }
}
