const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require("discord.js");

const commands = [
    new SlashCommandBuilder()
        .setName("help")
        .setDescription("Shows available commands"),

    new SlashCommandBuilder()
        .setName("serverinfo")
        .setDescription("Shows information about the current server"),

    new SlashCommandBuilder()
        .setName("avatar")
        .setDescription("Displays the avatar of a user")
        .addUserOption((option) =>
            option
                .setName("user")
                .setDescription("User to show avatar of")
                .setRequired(false),
        ),

    new SlashCommandBuilder()
        .setName("userinfo")
        .setDescription("Displays information about a user's account")
        .addUserOption((option) =>
            option
                .setName("user")
                .setDescription("User to show info for")
                .setRequired(false),
        ),
];

const handle = {
    help: async (interaction, { client }) => {
        const {
            ActionRowBuilder,
            ButtonBuilder,
            ButtonStyle,
        } = require("discord.js");

        // Define your links here
        const botInviteLink = `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`;
        const discordInviteLink = "https://discord.gg/YnHE8BgWVp";
        const topgg = "https://top.gg/bot/your-bot-id";
        const website = "https://plexi-bot.netlify.com/";

        const pages = [
            new EmbedBuilder()
                .setColor(0x5865f2)
                .setTitle("📚 Squadron Bot Commands - Page 1/2")
                .setDescription(
                    "**🐛 Debug Commands**\n\`/botinfo\` - Checks how many servers the bot is in\n\`/botsuggestion\` - Submit a suggestion\n\`/bugreport\` - Submit a bug report\n\`/discordserver\` - Bot's support server\n\`/invitelink\` - Bot invite link\n\`/ping\` - Bot latency\n\`/serversettings\` - Current settings\n\n**🎉 Fun Commands**\n\`/approved\` - Approve a profile picture\n\`/blur\` - Blur a profile picture\n\`/dogfact\` - Random dog fact\n\`/catfact\` - Random cat fact\n\`/joke\` - Random joke\n\`/8ball\` - Magic 8-Ball\n\`/coinflip\` - Flip a coin\n\`/dice\` - Roll a dice\n\`/meme\` - Random meme\n\`/quote\` - Inspirational quote\n\`/trivia\` - Trivia question\n\`/roast\` - Roast a user\n\`/compliment\` - Compliment a user",
                )
                .setFooter({ text: "Made by 6rgx | 80+ Commands" })
                .setTimestamp(),

            new EmbedBuilder()
                .setColor(0x5865f2)
                .setTitle("📚 Squadron Bot Commands - Page 2/2")
                .setDescription(
                    "**ℹ️ Info Commands**\n\`/avatar\` - User avatar\n\`/help\` - Command list\n\`/serverinfo\` - Server info\n\`/userinfo\` - User info\n\n**🔨 Staff Commands**\n\`/addnote\` - Add admin note\n\`/ban\` - Ban user\n\`/kick\` - Kick user\n\`/mute\` - Mute user\n\`/unmute\` - Unmute user\n\`/warn\` - Warn user\n\`/viewnotes\` - View notes\n\n**🎭 Role Commands**\n\`/giverole\` - Add role\n\`/takerole\` - Remove role\n\`/rolepicker\` - Role menu\n\n**👋 Welcome**\n\`/setwelcomechannel\` - Set channel\n\`/welcomemessage\` - Set message\n\`/welcomerole\` - Set role\n\`/togglewelcomemsg\` - Toggle\n\n**⭐ Other**\n\`/level\` - Check level\n\`/leaderboard\` - Server leaderboard\n\`/autorole\` - Auto role\n\`/automod\` - Auto-moderation\n\`/slowmode\` - Slowmode\n\`/lock\` - Lock channel\n\`/unlock\` - Unlock channel\n\n**Links:** [Add me](<${botInviteLink}>) | [Support](<${discordInviteLink}>) | [Vote](<${topgg}>) | [Website](<${website}>)",
                )
                .setFooter({ text: "Made by 6rgx | 80+ Commands" })
                .setTimestamp(),
        ];

        let currentPage = 0;

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("prev_page")
                .setLabel("◀ Previous")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(true),
            new ButtonBuilder()
                .setCustomId("next_page")
                .setLabel("Next ▶")
                .setStyle(ButtonStyle.Primary),
        );

        const message = await interaction.reply({
            embeds: [pages[currentPage]],
            components: [row],
            fetchReply: true,
        });

        const collector = message.createMessageComponentCollector({
            time: 300000, // 5 minutes
        });

        collector.on("collect", async (i) => {
            if (i.user.id !== interaction.user.id) {
                return await i.reply({
                    content: "❌ These buttons are not for you!",
                    ephemeral: true,
                });
            }

            if (i.customId === "prev_page") {
                currentPage--;
            } else if (i.customId === "next_page") {
                currentPage++;
            }

            const newRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("prev_page")
                    .setLabel("◀ Previous")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(currentPage === 0),
                new ButtonBuilder()
                    .setCustomId("next_page")
                    .setLabel("Next ▶")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(currentPage === pages.length - 1),
            );

            await i.update({
                embeds: [pages[currentPage]],
                components: [newRow],
            });
        });

        collector.on("end", () => {
            const disabledRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("prev_page")
                    .setLabel("◀ Previous")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(true),
                new ButtonBuilder()
                    .setCustomId("next_page")
                    .setLabel("Next ▶")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(true),
            );

            message.edit({ components: [disabledRow] }).catch(() => {});
        });
    },

    serverinfo: async (interaction) => {
        const guild = interaction.guild;
        if (!guild) {
            return await interaction.reply(
                "❌ This command can only be used in a server!",
            );
        }

        const embed = new EmbedBuilder()
            .setColor(0x5865f2)
            .setTitle(`📊 Server Information: ${guild.name}`)
            .setThumbnail(guild.iconURL())
            .addFields(
                { name: "Server ID", value: guild.id, inline: true },
                { name: "Owner", value: `<@${guild.ownerId}>`, inline: true },
                {
                    name: "Members",
                    value: guild.memberCount.toString(),
                    inline: true,
                },
                {
                    name: "Created",
                    value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`,
                    inline: true,
                },
                {
                    name: "Boost Level",
                    value: guild.premiumTier.toString(),
                    inline: true,
                },
                {
                    name: "Boost Count",
                    value: guild.premiumSubscriptionCount?.toString() || "0",
                    inline: true,
                },
            )
            .setTimestamp()
            .setFooter({ text: "Server Info", iconURL: guild.iconURL() });

        await interaction.reply({ embeds: [embed] });
    },

    avatar: async (interaction) => {
        const user = interaction.options.getUser("user") || interaction.user;

        const embed = new EmbedBuilder()
            .setColor(0x5865f2)
            .setTitle(`${user.username}'s Avatar`)
            .setDescription(
                `[Download Avatar](${user.displayAvatarURL({ size: 1024 })})`,
            )
            .setImage(user.displayAvatarURL({ size: 1024 }))
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    userinfo: async (interaction) => {
        const user = interaction.options.getUser("user") || interaction.user;
        const member = await interaction.guild.members
            .fetch(user.id)
            .catch(() => null);

        const embed = new EmbedBuilder()
            .setColor(0x5865f2)
            .setTitle(`👤 User Information: ${user.username}`)
            .setThumbnail(user.displayAvatarURL())
            .addFields(
                { name: "Username", value: user.tag, inline: true },
                { name: "ID", value: user.id, inline: true },
                {
                    name: "Account Created",
                    value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`,
                    inline: true,
                },
            );

        if (member) {
            embed.addFields(
                {
                    name: "Joined Server",
                    value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`,
                    inline: true,
                },
                {
                    name: "Nickname",
                    value: member.nickname || "None",
                    inline: true,
                },
                {
                    name: "Roles",
                    value:
                        member.roles.cache
                            .filter((r) => r.name !== "@everyone")
                            .map((r) => r.toString())
                            .join(", ") || "None",
                    inline: false,
                },
            );
        }

        await interaction.reply({ embeds: [embed] });
    },
};

module.exports = { commands, handle };
