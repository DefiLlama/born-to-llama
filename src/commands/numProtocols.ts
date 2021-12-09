import Command from "./commandInterface";
import { Message } from "discord.js";
import { getLiteProtocols } from './utils'

export class NumCommand implements Command {
  commandNames = ["protocols"];

  async run(message: Message): Promise<string> {
    const protocols = await getLiteProtocols()
    return `Protocols currently listed: ${protocols.length}`;
  }
}
