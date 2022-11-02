type AudioFn = (x: number) => (number | undefined);

export interface AudioSpec {
    waveType: string;
    frequency: number;
    amplitude: number;
    duty: number;
    skew: number;
    phase: number;
    bias: number;
    start: number;
    end: number;
    currentView: boolean;
    loop: boolean;
}
interface AudioNode{
    params: AudioSpec;
    fn: AudioFn;
    audioBuffer: AudioBuffer | null;
    bufferNode: AudioBufferSourceNode | null;
}

export enum Msg{
    addNode,
    removeNode,
    updateNode,
    startNode,
    stopNode
}
export class AudioManager {

    audioCtx: AudioContext;
    workletNode: AudioWorkletNode | null = null;
    customNodes: { [index: number]: AudioNode | undefined } = {};
    private playingNodes = 0;

    constructor() {
        this.audioCtx = new AudioContext();
        this.audioCtx.audioWorklet.addModule('./js/audio-processor.js')
        .then((value) => {
            this.workletNode = new AudioWorkletNode(this.audioCtx, 'audio-processor');
            this.workletNode.connect(this.audioCtx.destination);
        })
        // .catch(() => {
        //     console.error('Failed to create Audio processor worklet');
        // })
    }

    addNode(id: number, data: AudioSpec, fn?: AudioFn, buffer?: ArrayBuffer) {

        if (data.waveType == 'custom') {
            this.createCustomWave(id, data, fn ?? (() => 0));
        }
        else if (data.waveType == 'file') {
            if(buffer) this.createWaveFromFile(id, data, buffer);
        }
        else {
            this.workletNode?.port.postMessage({
                message: Msg.addNode,
                id: id,
                audio: data
            });
        }
    }

    removeNode(id: number) {
        this.stopNode(id);
        this.workletNode?.port.postMessage({
            message: Msg.removeNode,
            id: id
        });
        delete this.customNodes[id];
    }

    startNode(id: number, onended?: ((ev: Event) => any)) {
        if (this.customNodes[id]?.params.waveType == 'custom' || this.customNodes[id]?.params.waveType == 'file') {
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

    stopNode(id: number) {
        if (this.customNodes[id]?.params.waveType == 'custom' || this.customNodes[id]?.params.waveType == 'file') {
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

    private createCustomWave(id: number, params: AudioSpec, fn: AudioFn) {

        const buffer = new AudioBuffer({ length: this.audioCtx.sampleRate * (params.end - params.start), numberOfChannels: 1, sampleRate: this.audioCtx.sampleRate });
        let rawArray = buffer.getChannelData(0);
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

    private async createWaveFromFile(id: number, params: AudioSpec, data: ArrayBuffer) {
        const node: AudioNode = {
            fn: () => 0,
            audioBuffer: null,
            bufferNode: null,
            params
        }

        await this.audioCtx.decodeAudioData(data).then((decodedData) => {
            node.audioBuffer = decodedData;
            this.customNodes[id] = node;
        }).catch((reason) => {
            throw new Error(reason);
        });
    }

    private startCustomWave(id: number, onended?: ((ev: Event) => any)) {
        const node = this.customNodes[id];
        if (!node) return;

        node.bufferNode = new AudioBufferSourceNode(this.audioCtx, { buffer: node.audioBuffer, loop: node.params.loop });
        if (node.params.waveType == 'file') {
            node.bufferNode.loopStart = node.params.start;
            node.bufferNode.loopEnd = node.params.end;
        }
        node.bufferNode.connect(this.audioCtx.destination);
        node.bufferNode.onended = onended ?? null;
        node.bufferNode.start();
    }
}


export function sine(x: number, frequency: number, amplitude: number, phase: number, bias: number) {
    return amplitude / 100 * Math.sin(frequency * x / 1000 * 2 * Math.PI - phase / 180 * Math.PI);
}

export function square(x: number, frequency: number, amplitude: number, duty: number, phase: number, bias: number) {
    return amplitude / 100 * (mod(frequency * x / 1000 - phase / 360, 1) < (duty / 100) ? 1 : -1);
}

export function triangle(x: number, frequency: number, amplitude: number, skew: number, phase: number, bias: number) {
    amplitude /= 50;
    skew /= 100;
    const period = 1000 / frequency;
    x -= phase / 360 * period;
    x += skew * period / 2;
    x = mod(x, period);
    const freq = (frequency * x / 1000) * 2;
    return (x < skew * period ? mod(freq / (2 * skew), 1) : mod(-(freq - 2 * skew) / (2 * (1 - skew)), 1)) * amplitude - amplitude / 2;
}

function mod(x: number, m: number) {
    return ((x % m) + m) % m;
}