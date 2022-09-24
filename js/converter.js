export default class DataConverter {
    supportedTypes = [
        'text/csv',
        'application/json',
        'text/plain',
        //'text/xml'
        'audio/'
        //application/ogg
        //video/ogg
    ];
    static async convert(file) {
        if (file.type == 'application/json') {
            return this.convertJSON(await file.text());
        }
        return this.convertAudio(await file.arrayBuffer());
    }
    static async convertAudio(data) {
        const audioCtx = new AudioContext();
        const resultArray = [];
        await audioCtx.decodeAudioData(data).then((decodedData) => {
            const rawArray = decodedData.getChannelData(0);
            let x = 0;
            for (const val of rawArray) {
                resultArray.push({ x, y: val, connect: true, selected: false });
                x += 1 / decodedData.sampleRate;
            }
        }).catch((reason) => {
            throw new Error(reason);
        });
        return resultArray;
    }
    static async convertJSON(text) {
        const obj = JSON.parse(text);
        const resultArray = [];
        //now we have to guess the file structure
        if (Array.isArray(obj)) {
            if (obj.length > 1) {
                if (typeof obj[1] === 'number') {
                    //it is an array of numbers
                    for (let i = 0; i < obj.length; i++) {
                        resultArray.push({ x: i, y: obj[i], connect: true, selected: false });
                    }
                    return resultArray;
                }
                else if (typeof obj[1] === 'object') {
                }
            }
        }
        // for (const key in obj) {
        // }
        return resultArray;
    }
}
//# sourceMappingURL=converter.js.map