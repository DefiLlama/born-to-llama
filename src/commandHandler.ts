import { Message } from "discord.js";
import * as CommandModules from "./commands";
import Command from "./commands/commandInterface";
import { CommandParser } from "./models/commandParser";

export async function sendMessage(message: string, messageObj: Message) {
  const formattedMessage = "```\n" + message + "\n```" // Put it into a code block to prevent the format from getting messed up
  if(formattedMessage.length >= 2000){
    const lines = message.split('\n')
    if(lines.length <= 2){
      throw new Error("Lines are too long, reaching infinite recursivity")
    }
    const mid = Math.round(lines.length/2)
    await sendMessage(lines.slice(0, mid).join('\n'), messageObj)
    await sendMessage(lines.slice(mid).join('\n'), messageObj)
    return
  }
  messageObj.reply(formattedMessage)
}

export default class CommandHandler {

  private commands: Command[];

  private readonly prefix: string;

  constructor(prefix: string) {

    const commandClasses = Object.values(CommandModules);

    this.commands = commandClasses.map(commandClass => new commandClass());
    this.prefix = prefix;
  }

  /** Executes user commands contained in a message if appropriate. */
  async handleMessage(message: Message): Promise<void> {
    if (message.author.bot || !this.isCommand(message)) {
      return;
    }

    const commandParser = new CommandParser(message, this.prefix);

    if(commandParser.parsedCommandName === "help"){
      await message.reply(`Available commands: ${this.commands.reduce((t,c)=>[...t,...c.commandNames], [] as string[]).join(', ')}`);
      return
    }

    const matchedCommand = this.commands.find(command => command.commandNames.includes(commandParser.parsedCommandName));

    if (!matchedCommand) {
      await message.reply(`I don't recognize that command. Try !help.`);
    } else {
      await matchedCommand.run(message, commandParser)
      .then(messageToSend=>sendMessage(messageToSend, message))
      .catch(error => {
        message.reply(`'${this.echoMessage(message)}' failed because of ${error}`);
      });
    }
  }

  /** Sends back the message content after removing the prefix. */
  echoMessage(message: Message): string {
    return message.content.replace(this.prefix, "").trim();
  }

  /** Determines whether or not a message is a user command. */
  private isCommand(message: Message): boolean {
    return message.content.startsWith(this.prefix);
  }
}
