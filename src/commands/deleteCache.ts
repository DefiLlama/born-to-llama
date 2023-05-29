import Command from "./commandInterface";
import { Message } from "discord.js";
import { getRawLiteProtocols } from './utils'
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
    const {protocols, parentProtocols} = await getRawLiteProtocols()
    let protocol = protocols.concat(parentProtocols).find((p:any)=>p.name.toLowerCase() === protocolName.toLowerCase())
    if(protocol === undefined){
        return "No protocol with that name!"
    }
    let protocolId = protocol.defillamaId ?? protocol.id
    if(isTreasury){
      protocolId += "-treasury"
    }
    await deleteObjects(protocolId)
    return "Objects deleted"
  }
}
