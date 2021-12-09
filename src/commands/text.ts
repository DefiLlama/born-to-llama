import Command from "./commandInterface";
import { Message } from "discord.js";
export class TextCommand implements Command {
  commandNames = ["text"];

  async run(message: Message): Promise<string> {
    return `Hey, we would be happy to add your protocol to DefiLlama. Getting listed is easy and only requires that your protocol has an adapter that will provide its TVL. Here is some more info about how to write one:`
  }
}
