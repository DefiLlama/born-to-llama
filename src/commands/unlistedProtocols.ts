import Command from "./commandInterface";
import { Message } from "discord.js";
import { exec, getUnlistedProtocols } from './utils'

export class Unlisted implements Command {
    commandNames = ["unlisted"];

    async run(message: Message): Promise<string> {
        const unlisted = await getUnlistedProtocols()
        const unlistedWithdates = (await Promise.all(unlisted.map(async file=>{
            const gitMofificationDate = new Date((await exec(`cd DefiLlama-Adapters && git log -1 --format="%ad" -- ./projects/${file}`)).stdout)
            return {
                file,
                gitMofificationDate
            }
        }))).sort((a,b)=>a.gitMofificationDate.getTime()-b.gitMofificationDate.getTime())
        return `${unlistedWithdates.map(file=>`- ${file.file} (${file.gitMofificationDate.toDateString()})`).join('\n')}`;
    }
}
