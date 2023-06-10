import Command from "./commandInterface";
import { Message } from "discord.js";
import { CommandParser } from "../models/commandParser";
import axios from "axios";

const ADMIN_AUTH = process.env.ADMIN_AUTH;

export class RefreshIconCommand implements Command {
  commandNames = ["refresh-icon"];

  async run(message: Message, parsed: CommandParser): Promise<string> {
    if (!ADMIN_AUTH) {
      return "missing ADMIN_AUTH env variable";
    }
    const authorization = "Llama " + ADMIN_AUTH;

    const urls = parsed.args;
    if (!urls || urls.length === 0) {
      return "No url provided";
    }

    const res = await axios.post(
      "https://icons.llamao.fi/purge",
      { urls },
      {
        headers: {
          authorization,
          "Content-Type": "application/json",
        },
      }
    );

    if (res.status !== 200) {
      return `error ${res.status} purging cache: ${res.statusText}`;
    }

    return "icon cache purged";
  }
}
