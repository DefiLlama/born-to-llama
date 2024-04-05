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
    try{
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
    } catch(e){
        return (await axios.get("https://api.llama.fi/lite/protocols2")).data
    }
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

async function refreshAdapters() {
    return exec("rm -rf DefiLlama-Adapters && git clone --depth 1 https://github.com/DefiLlama/DefiLlama-Adapters")
}

async function refreshDimensionAdapters() {
    return exec("rm -rf dimension-adapters && git clone --depth 1 https://github.com/DefiLlama/dimension-adapters")
}

async function refreshEmissionsAdapters() {
    return exec("rm -rf emissions-adapters && git clone --depth 1 https://github.com/DefiLlama/emissions-adapters")
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

const ignoredFiles = [
    //files needed to help other run properly
    "helper", "config", "treasury","harvest.js", "1inch.js", "pawnfi", "synthetix-v1", "synthetix-v2", 
       
    //unlisted protocols
    "parallel-crowdloan", "opulous", "olafinance", "ocean-protocol", "astar-dapps-staking", "blackgoat-finance", "coconuts-finance", "cryptomate.js", "elevenfinance", "enso-finance",
    "evolutionland", "forcedao", "kccguru", "kokoswap", "lachainBridge.js", "liquidswap", "malt-money", "pole", "prosper", "quartzdefi", "safedollar", "solfire-protocol",  "solhero", 
    "tower-finance", "traverse", "union", "upfi.js", "xdao", "stacks", "pawnfi-nft", "algofi-valgo", "alpaca-finance-lend", "kleva-lend", "moonfarm.js",
    "rose-finance", "shadeprotocol-silk", "sencha", "swapcat", "shiden-dapps-staking", "fantom.js", "trxStakingGovernance", "scrt.js", 
]
export async function getUnlistedProtocols() {
    const refreshPromise = refreshAdapters()
    const protocols = await getSimpleProtocols()
    await refreshPromise;

    const [files, treasuries] = ['./DefiLlama-Adapters/projects/', `./DefiLlama-Adapters/projects/treasury/`]
        .map(dir => fs.readdirSync(dir))
    const modules = protocols.map(p => p.module.split('/')[0])
    const unlisted = files.filter(file => !modules.includes(file) && !ignoredFiles.includes(file)).concat(treasuries.map(t=>`treasury/${t}`))
    return unlisted
}

export async function getDimensionProtocolsAdapters() {
    await refreshDimensionAdapters()

    const files = ["aggregators", "dexs", "fees", "incentives", "options", "protocols"]
        .map(dir => ({files: fs.readdirSync(`./dimension-adapters/${dir}`), section: dir}))
        .reduce((total, curr)=>total.concat(curr.files.map(d=>`${curr.section}: ${d}`)), [] as string[]);
    return files
}

export async function getEmissionProtocolsAdapters() {
    await refreshEmissionsAdapters();
  
    const files = ['protocols']
      .map((dir) => fs.readdirSync(`./emissions-adapters/${dir}`))
      .reduce((total, curr) => total.concat(curr))
      .map((val) => val.replace('.ts', ''));

    return files;
}