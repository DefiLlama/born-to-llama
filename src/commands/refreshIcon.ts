import Command from "./commandInterface";
import { Message } from "discord.js";
import { CommandParser } from "../models/commandParser";

const ADMIN_AUTH = process.env.ADMIN_AUTH;

export class DeleteCacheCommand implements Command {
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

    const res = await fetch("https://icons.llamao.fi/purge", {
      method: "POST",
      headers: {
        authorization,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ urls }),
    });

    if (!res.ok) {
      return `Error: ${res.status} ${res.statusText}`;
    }

    return "icon cache purged";
  }
}
