
import axios from 'axios'
import Discord, { TextChannel } from "discord.js";
import config from './config/botConfig';

const API_ENDPOINT = 'https://api.llama.fi/chains'
const interval = 5 * 60 * 1000  // 5 minutes
const waitTime = 30 * 60 * 1000 // 30 minutes
let lastFailTimestamp = 0

async function isEndPointDown() {
  try {
    await axios.get(API_ENDPOINT);
  } catch(e: any) {
    return e.message;
  }
}

export function checkApiStatus(client: Discord.Client) {
  setInterval(async () => {
    const message = await isEndPointDown();

    if (!message) return;

    if ((Date.now() - lastFailTimestamp) < waitTime)  return; // we dont want to spam the channel, so we wait for some time before repeating the message
    lastFailTimestamp = Date.now();

    const teamChannel = await client.channels.fetch(config['team-channel']) as TextChannel;
    await teamChannel?.send(`@0xngmi Failed to reach ${API_ENDPOINT}
    Error: ${message}`);
  }, interval)
}