export var Msg;
(function (Msg) {
    Msg[Msg["addNode"] = 0] = "addNode";
    Msg[Msg["removeNode"] = 1] = "removeNode";
    Msg[Msg["updateNode"] = 2] = "updateNode";
    Msg[Msg["startNode"] = 3] = "startNode";
    Msg[Msg["stopNode"] = 4] = "stopNode";
})(Msg || (Msg = {}));
export class AudioManager {
    audioCtx;
    workletNode = null;
    customNodes = {};
    playingNodes = 0;
    constructor() {
        this.audioCtx = new AudioContext();
        this.audioCtx.audioWorklet.addModule('./js/audio-processor.js')
            .then((value) => {
            this.workletNode = new AudioWorkletNode(this.audioCtx, 'audio-processor');
            this.workletNode.connect(this.audioCtx.destination);
        });
        // .catch(() => {
        //     console.error('Failed to create Audio processor worklet');
        // })
    }
    addNode(id, data, fn) {
        if (data.waveType == 'custom') {
            this.createCustomWave(id, data, fn ?? (() => 0));
        }
        else {
            this.workletNode?.port.postMessage({
                message: Msg.addNode,
                id: id,
                audio: data
            });
        }
    }
    removeNode(id) {
        this.stopNode(id);
        this.workletNode?.port.postMessage({
            message: Msg.removeNode,
            id: id
        });
    }
    startNode(id, onended) {
        if (this.customNodes[id]?.params.waveType == 'custom') {
            this.startCustomWave(id, onended);
        }
        else {
            this.workletNode?.port.postMessage({
                message: Msg.startNode,
                id: id
            });
        }
        this.playingNodes++;
        this.audioCtx.resume();
    }
    stopNode(id) {
        if (this.customNodes[id]?.params.waveType == 'custom') {
            this.customNodes[id]?.bufferNode?.stop();
        }
        else {
            this.workletNode?.port.postMessage({
                message: Msg.stopNode,
                id: id
            });
        }
        this.playingNodes--;
        if (this.playingNodes === 0) {
            this.audioCtx.suspend();
        }
    }
    createCustomWave(id, params, fn) {
        const buffer = new AudioBuffer({ length: this.audioCtx.sampleRate * (params.end - params.start), numberOfChannels: 1, sampleRate: this.audioCtx.sampleRate });
        let rawArray = buffer.getChannelData(0);
        console.log(params.start);
        for (let i = 0; i < buffer.length; i++) {
            rawArray[i] = fn((i / this.audioCtx.sampleRate + params.start) * 1000) ?? 0;
        }
        this.customNodes[id] = {
            params,
            fn,
            audioBuffer: buffer,
            bufferNode: null
        };
    }
    startCustomWave(id, onended) {
        const node = this.customNodes[id];
        if (!node)
            return;
        node.bufferNode = new AudioBufferSourceNode(this.audioCtx, { buffer: node.audioBuffer, loop: node.params.loop });
        node.bufferNode.connect(this.audioCtx.destination);
        node.bufferNode.onended = onended ?? null;
        node.bufferNode.start();
    }
}
export function sine(x, frequency, amplitude, phase, bias) {
    return amplitude / 100 * Math.sin(frequency * x / 1000 * 2 * Math.PI - phase / 180 * Math.PI);
}
export function square(x, frequency, amplitude, duty, phase, bias) {
    return amplitude / 100 * (mod(frequency * x / 1000 - phase / 360, 1) < (duty / 100) ? 1 : -1);
}
export function triangle(x, frequency, amplitude, skew, phase, bias) {
    amplitude /= 50;
    skew /= 100;
    const period = 1000 / frequency;
    x -= phase / 360 * period;
    x += skew * period / 2;
    x = mod(x, period);
    const freq = (frequency * x / 1000) * 2;
    return (x < skew * period ? mod(freq / (2 * skew), 1) : mod(-(freq - 2 * skew) / (2 * (1 - skew)), 1)) * amplitude - amplitude / 2;
}
function mod(x, m) {
    return ((x % m) + m) % m;
}
//# sourceMappingURL=audio.js.map