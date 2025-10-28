const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const commands = [
    new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong and bot latency'),

    new SlashCommandBuilder()
        .setName('botinfo')
        .setDescription('Checks how many servers the bot is in'),

    new SlashCommandBuilder()
        .setName('botsuggestion')
        .setDescription('Submits a suggestion directly to the bot\'s Discord server')
        .addStringOption(option =>
            option.setName('suggestion')
                .setDescription('Your suggestion for the bot')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('bugreport')
        .setDescription('Submits a bug report directly to the bot\'s Discord server')
        .addStringOption(option =>
            option.setName('bug')
                .setDescription('Description of the bug')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('discordserver')
        .setDescription('Sends an invite link to the bot\'s support server'),

    new SlashCommandBuilder()
        .setName('invitelink')
        .setDescription('Sends the invite link for the bot'),

    new SlashCommandBuilder()
        .setName('serversettings')
        .setDescription('Shows current bot settings for this server'),

    new SlashCommandBuilder()
        .setName('testembed')
        .setDescription('Test if embeds are working'),
];

const handle = {
    ping: async (interaction, { client }) => {
        const ping = Date.now() - interaction.createdTimestamp;
        const apiPing = Math.round(client.ws.ping);

        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle('🏓 Pong!')
            .addFields(
                { name: 'Bot Latency', value: `${ping}ms`, inline: true },
                { name: 'API Latency', value: `${apiPing}ms`, inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    botinfo: async (interaction, { client }) => {
        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('🤖 Bot Information')
            .addFields(
                { name: 'Servers', value: client.guilds.cache.size.toString(), inline: true },
                { name: 'Users', value: client.users.cache.size.toString(), inline: true },
                { name: 'Uptime', value: `<t:${Math.floor((Date.now() - client.uptime) / 1000)}:R>`, inline: true },
                { name: 'Memory Usage', value: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`, inline: true },
                { name: 'Node.js Version', value: process.version, inline: true },
                { name: 'Discord.js Version', value: require('discord.js').version, inline: true }
            )
            .setThumbnail(client.user.displayAvatarURL())
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    botsuggestion: async (interaction, { db }) => {
        const suggestion = interaction.options.getString('suggestion');

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('✅ Bot Suggestion Submitted')
            .setDescription('Thank you for your suggestion! It has been forwarded to the development team.')
            .addFields(
                { name: 'Your Suggestion', value: suggestion },
                { name: 'User', value: `${interaction.user.tag} (${interaction.user.id})` },
                { name: 'Server', value: `${interaction.guild.name} (${interaction.guild.id})` }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

        // Log to database
        await db.collection('bot_suggestions').insertOne({
            userId: interaction.user.id,
            guildId: interaction.guild.id,
            suggestion: suggestion,
            timestamp: new Date()
        });
    },

    bugreport: async (interaction, { db }) => {
        const bug = interaction.options.getString('bug');

        const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('🐛 Bug Report Submitted')
            .setDescription('Thank you for reporting this bug! Our team will investigate it.')
            .addFields(
                { name: 'Bug Description', value: bug },
                { name: 'Reporter', value: `${interaction.user.tag} (${interaction.user.id})` },
                { name: 'Server', value: `${interaction.guild.name} (${interaction.guild.id})` }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

        // Log to database
        await db.collection('bug_reports').insertOne({
            userId: interaction.user.id,
            guildId: interaction.guild.id,
            bug: bug,
            timestamp: new Date()
        });
    },

    discordserver: async (interaction) => {
        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('🔗 Support Server')
            .setDescription('Join our support server for help and updates!')
            .setTimestamp();

        const button = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('Join Support Server')
                .setURL('https://discord.gg/your-support-server')
                .setStyle(ButtonStyle.Link)
        );

        await interaction.reply({ embeds: [embed], components: [button] });
    },

    invitelink: async (interaction, { client }) => {
        const inviteLink = `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`;

        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('🔗 Bot Invite Link')
            .setDescription('Use this link to add me to your server!')
            .setTimestamp();

        const button = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('Invite Bot')
                .setURL(inviteLink)
                .setStyle(ButtonStyle.Link)
        );

        await interaction.reply({ embeds: [embed], components: [button] });
    },

    serversettings: async (interaction, { serverConfigs }) => {
        if (!interaction.member.permissions.has('ManageGuild')) {
            return await interaction.reply({ content: '❌ You need Manage Server permissions!', ephemeral: true });
        }

        const config = serverConfigs.get(interaction.guild.id) || {};

        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('⚙️ Server Settings')
            .setDescription('Current configuration for this server:')
            .addFields(
                { name: 'Welcome Channel', value: config.welcomeChannel ? `<#${config.welcomeChannel}>` : 'Not set', inline: true },
                { name: 'Log Channel', value: config.logChannel ? `<#${config.logChannel}>` : 'Not set', inline: true },
                { name: 'Auto Role', value: config.autoRole ? `<@&${config.autoRole}>` : 'Not set', inline: true },
                { name: 'Welcome Enabled', value: config.welcomeEnabled ? '✅' : '❌', inline: true },
                { name: 'Leave Enabled', value: config.leaveEnabled ? '✅' : '❌', inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
    },

    setowner: async (interaction, { isOwner }) => {
        if (!isOwner(interaction.user.id)) {
            return await interaction.reply({ content: '❌ Only the current bot owner can use this command!', ephemeral: true });
        }

        const newOwner = interaction.options.getUser('user');

        const embed = new EmbedBuilder()
            .setColor('#ff9900')
            .setTitle('⚠️ Owner Transfer')
            .setDescription(`**Warning:** This will transfer bot ownership to ${newOwner.tag}!\n\nTo complete this action, please manually update the OWNER_ID environment variable in your Secrets to: \`${newOwner.id}\`\n\nAfter updating, restart the bot for changes to take effect.`)
            .addFields(
                { name: 'Current Owner', value: `<@${interaction.user.id}>`, inline: true },
                { name: 'New Owner', value: `<@${newOwner.id}>`, inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
    },

    ownerinfo: async (interaction, { isOwner, OWNER_ID, client }) => {
        if (!isOwner(interaction.user.id)) {
            return await interaction.reply({ content: '❌ Only the bot owner can use this command!', ephemeral: true });
        }

        const owner = await client.users.fetch(OWNER_ID).catch(() => null);

        const embed = new EmbedBuilder()
            .setColor('#gold')
            .setTitle('👑 Bot Owner Information')
            .addFields(
                { name: 'Owner', value: owner ? `${owner.tag} (<@${OWNER_ID}>)` : 'Unknown User', inline: true },
                { name: 'Owner ID', value: OWNER_ID || 'Not Set', inline: true },
                { name: 'Total Servers', value: client.guilds.cache.size.toString(), inline: true },
                { name: 'Total Users', value: client.users.cache.size.toString(), inline: true }
            )
            .setTimestamp();

        if (owner) {
            embed.setThumbnail(owner.displayAvatarURL());
        }

        await interaction.reply({ embeds: [embed], ephemeral: true });
    },

    serverlist: async (interaction, { isOwner, client }) => {
        if (!isOwner(interaction.user.id)) {
            return await interaction.reply({ content: '❌ Only the bot owner can use this command!', ephemeral: true });
        }

        const guilds = client.guilds.cache.sort((a, b) => b.memberCount - a.memberCount);
        const serverList = guilds.map((guild, index) => {
            return `**${index + 1}.** ${guild.name} (${guild.memberCount} members) - ID: \`${guild.id}\``;
        }).slice(0, 10).join('\n');

        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('🌐 Server List')
            .setDescription(serverList || 'No servers found')
            .addFields(
                { name: 'Total Servers', value: guilds.size.toString(), inline: true },
                { name: 'Showing', value: `Top ${Math.min(10, guilds.size)} servers`, inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
    },

    leaveserver: async (interaction, { isOwner, client }) => {
        if (!isOwner(interaction.user.id)) {
            return await interaction.reply({ content: '❌ Only the bot owner can use this command!', ephemeral: true });
        }

        const serverId = interaction.options.getString('serverid');
        const guild = client.guilds.cache.get(serverId);

        if (!guild) {
            return await interaction.reply({ content: '❌ Server not found or bot is not in that server!', ephemeral: true });
        }

        try {
            const guildName = guild.name;
            await guild.leave();

            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('🚪 Left Server')
                .setDescription(`Successfully left **${guildName}** (ID: \`${serverId}\`)`)
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (error) {
            await interaction.reply({ content: '❌ Failed to leave server!', ephemeral: true });
        }
    },

    testembed: async (interaction) => {
        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('✅ Embed Test')
            .setDescription('If you can see this, embeds are working correctly!')
            .addFields(
                { name: 'Test Field 1', value: 'This is a test', inline: true },
                { name: 'Test Field 2', value: 'This is also a test', inline: true }
            )
            .setTimestamp()
            .setFooter({ text: 'Squadron Bot Test', iconURL: interaction.client.user.displayAvatarURL() });

        try {
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({ content: `❌ Error sending embed: ${error.message}`, ephemeral: true });
        }
    }
};

module.exports = { commands, handle };