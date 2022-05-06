type BotConfig = {
  prefix: string                /** Prefix used for bot commands.    */
  "bot-health-channel": string  /** channel-id to post bot messages. */
  "unlisted-channel": string
  "team-channel": string
};

const config: BotConfig = {
  prefix: "gib",
  "bot-health-channel": "916383072675590195",
  "unlisted-channel": "922099070535884860",
  "team-channel": "852993195801182218",
};

export default config;
