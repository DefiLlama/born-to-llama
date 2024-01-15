import { getUnlistedProtocols, getDimensionProtocolsAdapters, getEmissionProtocolsAdapters } from './commands/utils'
import config from './config/botConfig';
import Discord, { TextChannel } from "discord.js";

let unlisted = [] as string[]
let dimensionAdapters = [] as string[]
let emissionAdapters = [] as string[]

export function setUnlistedProtocols() {
    getUnlistedProtocols().then(newUnlisted => {
        unlisted = newUnlisted;
    })
    getDimensionProtocolsAdapters().then(adapters=>{
        dimensionAdapters = adapters;
    })

    getEmissionProtocolsAdapters().then(adapters=>{ 
        emissionAdapters = adapters;
    })
}

export async function triggerUnlistedAlarms(client: Discord.Client) {
    await Promise.all([triggerUnlistedTvlAlarms(client), triggerUnlistedDimensionAlarms(client), triggerUnlistedEmissionAlarms(client)])
}

async function triggerUnlistedTvlAlarms(client: Discord.Client) {
    const newUnlisted = await getUnlistedProtocols()
    const oldUnlisted = [...unlisted];
    unlisted = newUnlisted;
    
    await alertUnlisted(newUnlisted, oldUnlisted, client)
}

async function triggerUnlistedDimensionAlarms(client: Discord.Client) {
    const newUnlisted = await getDimensionProtocolsAdapters()
    const oldUnlisted = [...dimensionAdapters];
    dimensionAdapters = newUnlisted;
    
    await alertUnlisted(newUnlisted, oldUnlisted, client)
}

export async function triggerUnlistedEmissionAlarms(client: Discord.Client) {
    const newUnlisted = await getEmissionProtocolsAdapters()
    const oldUnlisted = [...emissionAdapters];
    emissionAdapters = newUnlisted;
    
   await alertUnlisted(newUnlisted, oldUnlisted, client, 'Unlocks');
}

async function alertUnlisted(newUnlisted: string[], oldUnlisted: string[], client: Discord.Client, section?: string) {
    const sectionMsg = section ? `${section}: ` : '';
    await Promise.all(newUnlisted.map(async protocol => {
        if (!oldUnlisted.includes(protocol)) {
            const unlistedChannel = await client.channels.fetch(config['unlisted-channel']) as TextChannel;
            await unlistedChannel?.send(`${sectionMsg}${protocol} has been added`);
        }
    }))
}
