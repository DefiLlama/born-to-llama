import Command from "./commandInterface";
import { Message } from "discord.js";
import { CommandParser } from "../models/commandParser"
import axios from "axios";

interface CMCItem {
    first_historical_data: string
    id: number
    is_active: number
    last_historical_data: string
    name: string
    rank: number
    slug: string
    status: string
    symbol: string
}

interface CGItem {
    id: string
    name: string
    platforms: any
    symbol: string
}

function processItems(items: (CMCItem | CGItem)[], symbol: string) {
    return items.filter((t) => t.symbol.toLowerCase() === symbol)
        .map(t => `${t.id} (${t.name})`).join(', ')
}

export class TokenIdsCommand implements Command {
    commandNames = ["token"];

    async run(message: Message, parsed: CommandParser): Promise<string> {
        const [cg, cmc] = await Promise.all([
            axios.get("https://api.coingecko.com/api/v3/coins/list?include_platform=true"),
            axios.get("https://api.coinmarketcap.com/data-api/v3/map/all?listing_status=active,inactive,untracked&start=1&limit=10000")
        ])
        const symbol = parsed.args[0].toLowerCase()
        const cmcIds = processItems(cmc.data.data.cryptoCurrencyMap, symbol)
        const cgIds = processItems(cg.data, symbol)

        return `Coingecko: ${cgIds}
CMC: ${cmcIds}`;
    }
}
