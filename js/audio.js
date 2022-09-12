export class AudioManager {
    //playing = false;
    audioCtx;
    gainNode1;
    gainNode2;
    audioBuffer1;
    audioBuffer2;
    bufferNode1 = null;
    bufferNode2 = null;
    nodes = {};
    playingNodes = 0;
    constructor() {
        this.audioCtx = new AudioContext();
        this.gainNode1 = this.audioCtx.createGain();
        this.gainNode2 = this.audioCtx.createGain();
        this.gainNode1.connect(this.audioCtx.destination);
        this.gainNode2.connect(this.audioCtx.destination);
        this.audioBuffer1 = this.audioCtx.createBuffer(1, this.audioCtx.sampleRate, this.audioCtx.sampleRate);
        this.audioBuffer2 = this.audioCtx.createBuffer(1, this.audioCtx.sampleRate, this.audioCtx.sampleRate);
    }
    addNode(id, fn) {
        const node = this.nodes[id] = {
            playing: false,
            fn,
            //oscNode: this.audioCtx.createOscillator(),
            //gainNode: this.audioCtx.createGain(),
            //audioBuffer: this.audioCtx.createBuffer(1, this.audioCtx.sampleRate, this.audioCtx.sampleRate),
            //bufferNode: null
        };
    }
    removeNode(id) {
        this.nodes[id] = undefined;
    }
    getNode(id) {
        const line = this.nodes[id];
        if (!line)
            throw new Error('Node with this ID does not exist');
        return line;
    }
    /*stop(stopTime = 0.1) {
        stopTime += this.audioCtx.currentTime;
        this.gainNode.gain.exponentialRampToValueAtTime(0.01, stopTime);
        //this.gainNode.gain.setValueAtTime(0.01, stopTime);
        //for (const nodeKey in this.nodes) {
        //    this.nodes[nodeKey]?.bufferNode?.stop(stopTime);
        //}
        this.bufferNode?.stop(stopTime);
    }*/
    //stopNode(id: number) {
    //    this.nodes[id]?.bufferNode?.stop();
    //}
    usingBuffer1 = true;
    start(startTime = 0.001) {
        startTime += this.audioCtx.currentTime;
        const currentBuffer = this.usingBuffer1 ? this.audioBuffer1 : this.audioBuffer2;
        const currentGain = this.usingBuffer1 ? this.gainNode1 : this.gainNode2;
        const oldGain = this.usingBuffer1 ? this.gainNode2 : this.gainNode1;
        this.usingBuffer1 = !this.usingBuffer1;
        let rawArray = currentBuffer.getChannelData(0);
        for (let i = 0; i < currentBuffer.length; i++) {
            rawArray[i] = 0;
        }
        this.playingNodes = 0;
        for (const nodeKey in this.nodes) {
            const node = this.nodes[nodeKey];
            if (!node || !node.playing)
                continue;
            this.playingNodes++;
            //node.bufferNode = new AudioBufferSourceNode(this.audioCtx, { buffer: node.audioBuffer, loop: true });
            //node.bufferNode.connect(this.gainNode);
            for (let i = 0; i < currentBuffer.length; i++) {
                rawArray[i] += node.fn(i * 1000 / this.audioCtx.sampleRate); //Math.sin(i * 2 * Math.PI / this.audioCtx.sampleRate * 1000);
            }
        }
        //this.stop(0);
        //this.bufferNode?.disconnect();
        if (this.playingNodes === 0) {
            this.bufferNode2?.stop();
            this.bufferNode2?.disconnect();
            return;
        }
        ;
        //if (!this.bufferNode) {
        this.bufferNode1 = new AudioBufferSourceNode(this.audioCtx, { buffer: currentBuffer, loop: true });
        //this.bufferNode.connect(this.gainNode);
        //this.bufferNode.start();
        //}
        //return;
        //this.bufferNode.buffer = this.audioBuffer;
        this.bufferNode1.connect(currentGain);
        //this.gainNode.gain.value = 1;
        //because FF
        currentGain.gain.setValueAtTime(0.0001, this.audioCtx.currentTime);
        currentGain.gain.exponentialRampToValueAtTime(1.0, this.audioCtx.currentTime + 0.1);
        //for (const nodeKey in this.nodes) {
        //    this.nodes[nodeKey]?.bufferNode?.start(startTime);
        //}
        this.bufferNode1.start();
        const stopTime = this.audioCtx.currentTime + 0.1;
        oldGain.gain.exponentialRampToValueAtTime(0.0001, stopTime);
        this.bufferNode2?.stop(stopTime);
        //this.bufferNode2?.disconnect();
        this.bufferNode2 = this.bufferNode1;
    }
}
//# sourceMappingURL=audio.js.map