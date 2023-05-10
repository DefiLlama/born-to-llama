import Command from "./commandInterface";
import { Message } from "discord.js";
import { getLiteProtocols } from './utils'
import {CommandParser} from "../models/commandParser"
import { deleteObjects } from "../utils/r2";

export class DeleteCacheCommand implements Command {
  commandNames = ["delete-cache"];

  async run(message: Message, parsed:CommandParser): Promise<string> {
    let protocolName = parsed.args.join(" ")
    const isTreasury = protocolName.endsWith("(treasury)")
    if(isTreasury){
      protocolName = protocolName.slice(0, -" (treasury)".length)
    }
    const protocols = await getLiteProtocols()
    let protocolId = protocols.find(p=>p.name.toLowerCase() === protocolName.toLowerCase())?.defillamaId
    if(protocolId === undefined){
        return "No protocol with that name!"
    }
    if(isTreasury){
      protocolId += "-treasury"
    }
    await deleteObjects(protocolId)
    return "Objects deleted"
  }
}
