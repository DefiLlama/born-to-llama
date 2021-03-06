import axios from "axios";
import zlib from "zlib"
import { Stream } from "stream";
import util from 'util'
import { exec as execRaw } from "child_process"
import fs from "fs"

function streamToString(stream: Stream) {
    const chunks = [] as any[];
    return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        stream.on('error', (err) => reject(err));
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    })
}

export async function getRawLiteProtocols() {
    const protocols = await axios.get("https://api.llama.fi/lite/protocols2", {
        decompress: false,
        responseType: 'stream',
        // if you want to enhance the default transformResponse, instead of replacing,
        // use an array to contain both the default and the customized
        transformResponse(data) {
            return data.pipe(zlib.createBrotliDecompress())
        }
    }).then(r => streamToString(r.data)) as any
    return JSON.parse(protocols) as any
}


export async function getLiteProtocols() {
    const protocols = await getRawLiteProtocols()
    return protocols.protocols as any[]
}

export async function getProtocols() {
    const protocols = await axios.get("https://api.llama.fi/protocols")
    return protocols.data as any[]
}

export async function getSimpleProtocols() {
    const protocols = await axios.get("https://api.llama.fi/config")
    return protocols.data.protocols as any[]
}

export const exec = util.promisify(execRaw);

export async function refreshAdapters() {
    return exec("rm -rf DefiLlama-Adapters && git clone https://github.com/DefiLlama/DefiLlama-Adapters")
}

export async function topChangers(args: string[], gainers: boolean) {
    let prop = "change_1d"
    if (args[0] === "week") {
        prop = "change_7d"
    }
    const amountToDisplay = Number(args[1] ?? 10)
    const protocols = (await getProtocols()).filter(p=>typeof p[prop] === "number").sort((a, b) =>
        gainers ? b[prop] - a[prop] : a[prop] - b[prop]
    ).slice(0, amountToDisplay)
    return protocols.map(p => `${p[prop].toFixed(2)}% - ${p.name} - ${p.tvl}`).join('\n');
}

const ignoredFiles = ["helper", "config"]
export async function getUnlistedProtocols() {
    const refreshPromise = refreshAdapters()
    const protocols = await getSimpleProtocols()
    await refreshPromise;

    const files = fs.readdirSync('./DefiLlama-Adapters/projects/');
    const modules = protocols.map(p => p.module.split('/')[0])
    const unlisted = files.filter(file => !modules.includes(file) && !ignoredFiles.includes(file))
    return unlisted
}