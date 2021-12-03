import Command from "./commandInterface";
import { Message } from "discord.js";
import { getLiteProtocols } from './utils'

export class NumCommand implements Command {
  commandNames = ["protocols"];

  async run(message: Message): Promise<void> {
    const protocols = await getLiteProtocols()
    await message.reply(`Protocols currently listed: ${protocols.length}`);
  }
}
