import express, { Request, Response } from 'express';
import Discord, { Message , TextChannel, Intents } from "discord.js";
import { DISCORD_TOKEN } from './config/secrets';
import CommandHandler from './commandHandler';
import config from './config/botConfig';
import {setUnlistedProtocols, triggerUnlistedAlarms} from './unlistedAlerts'
import { getMostVisitedPages } from './reports/buildReport';

const PORT = process.env.PORT || 5000;

const app = express();
const client = new Discord.Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

app.get('/refresh', (request: Request, response: Response) => {
  triggerUnlistedAlarms(client);
  response.sendStatus(200);
});

app.use('/send-daily-report', (request: Request, response: Response) => {
  getMostVisitedPages();
  response.sendStatus(200);
});

app.use(express.urlencoded({ extended: true }));

app.use('/', (request: Request, response: Response) => {
  response.sendStatus(200);
});

const commandHandler = new CommandHandler(config.prefix);

client.on("ready", async () => {
  const botHealthChannel = await client.channels.fetch(config['bot-health-channel']) as TextChannel ;
  console.log("Starting");
  //await botHealthChannel?.send("Bot has started");
});
client.on("messageCreate", (message: Message) => { commandHandler.handleMessage(message); });
client.on("error", e => { console.error("Discord client error!", e); });

client.login(DISCORD_TOKEN);
app.listen(PORT, () => console.log(`Server started on port ${PORT}!`));

setUnlistedProtocols();