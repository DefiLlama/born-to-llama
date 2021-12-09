import Command from "./commandInterface";
import { Message } from "discord.js";

export class TimeCommand implements Command {
  commandNames = ["time"];

  help(commandPrefix: string): string {
    return `Use ${commandPrefix}time to current time.`;
  }

  async run(message: Message): Promise<string> {
    const now = new Date();
    return `Current timestamp: ${Math.floor(now.getTime()/1000)}`;
  }
}
