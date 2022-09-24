"use strict";
//import { sine, square, triangle, Msg } from './audio.js';
//import { AudioSpec } from './audio.js'
class AudioProcessor extends AudioWorkletProcessor {
    nodes = {};
    constructor() {
        super();
        this.port.onmessage = this.onMessage.bind(this);
    }
    onMessage(event) {
        switch (event.data.message) {
            case Msg.addNode:
                this.nodes[event.data.id] = { params: event.data.audio, playing: false };
                break;
            case Msg.removeNode:
                this.nodes[event.data.id] = undefined;
                break;
            // case Msg.updateNode:
            //     break;
            case Msg.startNode:
                if (this.nodes[event.data.id])
                    this.nodes[event.data.id].playing = true;
                break;
            case Msg.stopNode:
                if (this.nodes[event.data.id])
                    this.nodes[event.data.id].playing = false;
                break;
        }
    }
    x = 0;
    process(inputs, outputs, parameters) {
        for (const output of outputs) {
            for (const channelData of output) {
                for (let i = 0; i < channelData.length; i++) {
                    for (const nodeKey in this.nodes) {
                        const node = this.nodes[nodeKey];
                        if (!node || !node.playing)
                            continue;
                        switch (node.params.waveType) {
                            case 'sine':
                                channelData[i] += sine(this.x * 1000 / sampleRate, node.params.frequency, node.params.amplitude, node.params.phase, 0);
                                break;
                            case 'square':
                                channelData[i] += square(this.x * 1000 / sampleRate, node.params.frequency, node.params.amplitude, node.params.duty, node.params.phase, 0);
                                break;
                            case 'triangle':
                                channelData[i] += triangle(this.x * 1000 / sampleRate, node.params.frequency, node.params.amplitude, node.params.skew, node.params.phase, 0);
                                break;
                        }
                    }
                    this.x++;
                }
            }
        }
        return true;
    }
}
registerProcessor('audio-processor', AudioProcessor);
function sine(x, frequency, amplitude, phase, bias) {
    return amplitude / 100 * Math.sin(frequency * x / 1000 * 2 * Math.PI - phase / 180 * Math.PI);
}
function square(x, frequency, amplitude, duty, phase, bias) {
    return amplitude / 100 * (mod(frequency * x / 1000 - phase / 360, 1) < (duty / 100) ? 1 : -1);
}
function triangle(x, frequency, amplitude, skew, phase, bias) {
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
//this has to be in sync with Msg in audio.ts
var Msg;
(function (Msg) {
    Msg[Msg["addNode"] = 0] = "addNode";
    Msg[Msg["removeNode"] = 1] = "removeNode";
    Msg[Msg["updateNode"] = 2] = "updateNode";
    Msg[Msg["startNode"] = 3] = "startNode";
    Msg[Msg["stopNode"] = 4] = "stopNode";
})(Msg || (Msg = {}));
// @ts-nocheck
//# sourceMappingURL=audio-processor.js.map