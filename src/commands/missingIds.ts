import Command from "./commandInterface";
import { Message } from "discord.js";
import { CommandParser } from "../models/commandParser";
import { getProtocols } from './utils';
import axios from "axios";

interface CMCItem {
	first_historical_data: string;
	id: number;
	is_active: number;
	last_historical_data: string;
	name: string;
	rank: number;
	slug: string;
	status: string;
	symbol: string;
}

interface CGItem {
	id: string;
	name: string;
	platforms: any;
	symbol: string;
}

interface Protocol {
	name: string;
	cmcId: string;
	gecko_id: string;
	symbol: string;
	deadUrl?: boolean;
	parentProtocol?: string;
}

function processItems(items: (CMCItem | CGItem)[], symbol: string): string[] {
	symbol = symbol.toLowerCase();
	return items
		.filter((t) => t.symbol.toLowerCase() === symbol)
		.map((t) => `${t.id} (${t.name})`);
}

export class MissingIdsCommand implements Command {
	commandNames = ["missing-ids"];

	async run(message: Message, parsed: CommandParser): Promise<string> {
		const [
			{ data: coinGeckoData },
			{ data: { data: { cryptoCurrencyMap } } },
			allProtocols
		] = await Promise.all([
			axios.get<CGItem[]>(
				"https://api.coingecko.com/api/v3/coins/list?include_platform=true"
			),
			axios.get<{ data: { cryptoCurrencyMap: { [key: string]: CMCItem } } }>(
				"https://api.coinmarketcap.com/data-api/v3/map/all?listing_status=active,inactive,untracked&start=1&limit=10000"
			),
			getProtocols(),
		]);

		// Filter out any protocols marked deadUrl: true or that have a parentProtocol
		const protocols = (allProtocols as Protocol[]).filter(
			(p) => !p.deadUrl && !p.parentProtocol
		);

		// Protocols missing a symbol
		const namelessProtocols = protocols.filter((p) => !p.symbol).map((p) => p.name);
		// Protocols missing one or both IDs
		const incompleteProtocols = protocols.filter((p) => !p.cmcId || !p.gecko_id);

		let returnText = `Protocols without tokens: ${namelessProtocols.length}\n${getSetsText(namelessProtocols)}`;
		const divider = "\n ---------- \n";
		const missingGecko: string[] = [];
		const missingCMC: string[] = [];
		const missingBoth: string[] = [];
		let fixableText = "";

		incompleteProtocols
			.filter((p) => p.symbol)
			.forEach(({ symbol, cmcId, gecko_id, name }) => {
				const cmcIds = processItems(Object.values(cryptoCurrencyMap), symbol);
				const cgIds = processItems(coinGeckoData, symbol);
				const cmcSet = !cmcId && cmcIds.length > 0;
				const cgSet = !gecko_id && cgIds.length > 0;

				if (cmcSet || cgSet) {
					fixableText += `\n\n${name} (${symbol}):`;
					if (cmcSet) fixableText += `\n - CMC: ${cmcIds.join(", ")}`;
					if (cgSet) fixableText += `\n - Coingecko: ${cgIds.join(", ")}`;
				} else {
					if (cmcId) missingGecko.push(name);
					else if (gecko_id) missingCMC.push(name);
					else missingBoth.push(name);
				}
			});

		return [
			returnText,
			`Unable to find token in Coingecko: ${missingGecko.length}\n${getSetsText(missingGecko)}`,
			`Unable to find token in CMC: ${missingCMC.length}\n${getSetsText(missingCMC)}`,
			`Unable to find token in both: ${missingBoth.length}\n${getSetsText(missingBoth)}`,
			fixableText,
		].join(divider);
	}
}

function getSetsText(array: string[], size = 10): string {
	const replyText: string[] = [];
	for (let i = 0; i < array.length; i += size) {
		replyText.push(array.slice(i, i + size).join(", "));
	}
	return replyText.join("\n");
}
