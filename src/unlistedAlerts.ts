import { getUnlistedProtocols } from './commands/utils'
import config from './config/botConfig';
import Discord, { TextChannel } from "discord.js";

let unlisted = [] as string[]

export function setUnlistedProtocols() {
    getUnlistedProtocols().then(newUnlisted => {
        unlisted = newUnlisted;
    })
}

export async function triggerUnlistedAlarms(client: Discord.Client) {
    const newUnlisted = await getUnlistedProtocols()
    const oldUnlisted = [...unlisted];
    unlisted = newUnlisted;
    await Promise.all(newUnlisted.map(async protocol => {
        if (!oldUnlisted.includes(protocol)) {
            const unlistedChannel = await client.channels.fetch(config['unlisted-channel']) as TextChannel;
            await unlistedChannel?.send(`${protocol} has been added`);
        }
    }))
}
