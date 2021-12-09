import Command from "./commandInterface";
import { Message } from "discord.js";
import { topChangers } from './utils'
import {CommandParser} from "../models/commandParser"

export class GainersCommand implements Command {
  commandNames = ["gainers", "losers"];

  async run(message: Message, parsed:CommandParser): Promise<string> {
    return await topChangers(parsed.args, parsed.parsedCommandName ==="gainers");
  }
}
