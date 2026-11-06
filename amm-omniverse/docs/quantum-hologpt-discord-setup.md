# Quantum HoloGPT — first Discord application

Recommended: **one Discord application**, installed separately into Quantum Discord and All American Marketplace. Use `DISCORD_ALLOWED_GUILD_IDS` to explicitly authorize each server. No shared private channel data, payment privileges or automatic admin permissions.

## Owner setup (required)

1. In https://discord.com/developers/applications choose **New Application** and name it **Quantum HoloGPT**. Keep your bot token and application credentials private.
2. In **General Information**, copy the Application ID and Public Key into your secure deployment settings (not browser `VITE_` variables).
3. Deploy the `amm-omniverse` project to a platform that supports the `api/discord/interactions.mjs` serverless function. Set its Discord Interactions Endpoint URL to `https://YOUR-DOMAIN/api/discord/interactions`. Discord must successfully verify the PING signature.
4. Add server-only environment variables:
   - `DISCORD_PUBLIC_KEY`: Discord application's public key (not secret)
   - `DISCORD_ALLOWED_GUILD_IDS`: comma-separated IDs of your two Discord servers
   - `OPENAI_API_KEY`: AI provider API key (server-only)
   - `OPENAI_MODEL`: optional model name (default `gpt-4.1-mini`)
5. In Discord Installation settings enable **Guild Install** with scopes `applications.commands` and `bot`, with minimum permissions. Authorize the application into each server yourself.
6. Register one guild slash command using Discord's authenticated API or the developer portal's command tools:
   - command `hologpt` (type CHAT_INPUT)
   - subcommand `ask` with required string option `question` (max 500)
   - subcommand `help` with no options.
7. Run `node tests/quantum-discord-backend.test.mjs` and the GitHub CI checks, then test `/hologpt help` and `/hologpt ask question:How do I enter Sculptify?` in both servers.

## Important deployment and safety notes

- This is a first server-side implementation, **not a deployed or authorized Discord application**. The application must be created by the server owner, who must authorize each installation.
- Discord requires an initial interaction response within about three seconds. The implementation limits its AI call to 2.2 seconds and falls back to a helpful error; longer AI responses should use deferred responses and follow-up webhooks.
- The endpoint requires the **exact raw HTTP request bytes** to verify the Ed25519 signature. Confirm that your host exposes unmodified raw bodies; if it pre-parses JSON, configure raw-body handling before activation.
- Guild IDs must be obtained from Discord, not guessed from invite URLs. An invite link is not proof of bot authorization.
- Do not use the bot for payouts, customer financial records, moderation enforcement or whitelist approvals without dedicated server-side authorization and audit logs.
- Costs and deployments depend on the host and AI provider. Keep the bot disabled until deployment and credential checks pass.
