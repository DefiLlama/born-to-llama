type BotConfig = {
  prefix: string                /** Prefix used for bot commands.    */
  "bot-health-channel": string  /** channel-id to post bot messages. */
};

const config: BotConfig = {
  prefix: "gib",
  "bot-health-channel": "916383072675590195"
};

export default config;
