import Command from "./commandInterface";
import { Message } from "discord.js";
import { getLiteProtocols } from './utils'

const ONE_DAY = 24*3600;

export class StatsCommand implements Command {
  commandNames = ["stats"];

  async run(message: Message): Promise<string> {
    const protocols = await getLiteProtocols()
    const now = Date.now()/1000
    const listedLastDay = protocols.filter(p=>p.listedAt>(now-ONE_DAY))
    const listedLastweek = protocols.filter(p=>p.listedAt>(now-ONE_DAY*7))
    return `Total protocols: ${protocols.length}
Listed over the last 24hrs: ${listedLastDay.length}
Listed over the last week: ${listedLastweek.length}`;
  }
}
