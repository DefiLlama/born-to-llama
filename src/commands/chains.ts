import Command from "./commandInterface";
import { Message } from "discord.js";
import { getRawLiteProtocols } from './utils'

export class NumChainsCommand implements Command {
  commandNames = ["chains"];

  async run(message: Message): Promise<string> {
    const {chains} = await getRawLiteProtocols()
    return `Chains currently listed: ${chains.length}`;
  }
}
