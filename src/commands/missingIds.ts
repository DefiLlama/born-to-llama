import Command from "./commandInterface"
import { Message } from "discord.js"
import { CommandParser } from "../models/commandParser"
import { getProtocols } from './utils'
import axios from "axios"

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

interface Protocol {
	name: string
	cmcId: string
	gecko_id: string
	symbol: string
}

function processItems(items: (CMCItem | CGItem)[], symbol: string) {
	symbol = symbol.toLowerCase()
	return items.filter((t) => t.symbol.toLowerCase() === symbol)
		.map(t => `${t.id} (${t.name})`)
}

export class MissingIdsCommand implements Command {
	commandNames = ["missing-ids"]

	async run(message: Message, parsed: CommandParser): Promise<string> {
		const [{ data: coinGeckoData }, {
			data: { data: { cryptoCurrencyMap: cmcData } }
		}, protocols] = await Promise.all([
			axios.get("https://api.coingecko.com/api/v3/coins/list?include_platform=true"),
			axios.get("https://api.coinmarketcap.com/data-api/v3/map/all?listing_status=active,inactive,untracked&start=1&limit=10000"),
			getProtocols()
		])

		const incompleteProtocols = protocols.filter(p => !p.cmcId || !p.gecko_id)
		const namelessProtocols = protocols.filter(p => !p.symbol).map(p => p.name).join(' ')
		let returnText = `Protocols without tokens: ${namelessProtocols}`
		const divider = '\n ---------- \n'
		const missingGecko: string[] = []
		const missingCMC: string[] = []
		const missingBoth: string[] = []
		let fixableText = ''

		incompleteProtocols
			.filter(p => p.symbol)
			.forEach(({ symbol, cmcId, gecko_id, name }: Protocol) => {
				const cmcIds = processItems(cmcData, symbol)
				const cgIds = processItems(coinGeckoData, symbol)
				let cmcSet = !cmcId && cmcIds.length
				let cgSet = !gecko_id && cgIds.length
				if (cmcSet || cgSet) {
					fixableText = `${fixableText}\n\n${name} (${symbol}):`
					if (cmcSet) fixableText = `${fixableText}\n - CMC: ${cmcIds.join(', ')}`
					if (cgSet) fixableText = `${fixableText}\n - Coingecko: ${cgIds.join(', ')}`
				} else if (!cmcSet && !cgSet) {
					if (cmcId) missingGecko.push(name)
					else if (gecko_id) missingCMC.push(name)
					else missingBoth.push(name)
				}
			})

		return [
			returnText,
			`Unable to find token in Coingecko: ${missingGecko.join(', ')}`,
			`Unable to find token in CMC: ${missingCMC.join(', ')}`,
			`Unable to find token in both: ${missingBoth.join(', ')}`,
			fixableText,
		].join(divider)
	}
}
