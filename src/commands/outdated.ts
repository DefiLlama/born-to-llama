import Command from "./commandInterface";
import { Message } from "discord.js";
import { getProtocols } from './utils';
import { CommandParser } from "../models/commandParser"
import axios from "axios";

function readableDate(seconds:number){
    const mins = seconds/60
    if(mins > 120){
        return `${(mins/60).toFixed(2)} hours ago`
    } else {
        return `${mins.toFixed(2)} minutes ago`
    }
}

export class OutdatedCommand implements Command {
    commandNames = ["outdated"];

    async run(message: Message, parsed: CommandParser): Promise<string> {
        const chain = parsed.args[0].toLowerCase()
        const protocols = (await getProtocols()).filter(p=>p.chains.some((c:string)=>c.toLowerCase() === chain))
        if(protocols.length === 0){
            return `No protocol with chain "${chain}" (case insensitive)`
        }
        const now = Date.now()/1e3
        const protocolData = await Promise.all(
            protocols.map(p=>axios.get(`https://api.llama.fi/protocol/${p.slug}`).then(t=>{
                const tvls = t.data.tvl
                const last = now - tvls[tvls.length-1].date 
                return {
                    name: p.name,
                    last
                }
            }))
        )
        const text = protocolData.sort((a,b)=>b.last-a.last).map(p=>`${p.name}\t- ${readableDate(p.last)}`).join('\n')

        return text;
    }
}
