import Command from "./commandInterface";
import { Message } from "discord.js";
import { getSimpleProtocols, refreshAdapters, exec } from './utils'
import fs from "fs"

const ignoredFiles = ["helper", "config"]

export class Unlisted implements Command {
    commandNames = ["unlisted"];

    async run(message: Message): Promise<string> {
        const refreshPromise = refreshAdapters()
        const protocols = await getSimpleProtocols()
        await refreshPromise;

        const files = fs.readdirSync('./DefiLlama-Adapters/projects/');
        const modules = protocols.map(p => p.module.split('/')[0])
        const unlisted = files.filter(file => !modules.includes(file) && !ignoredFiles.includes(file))
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
