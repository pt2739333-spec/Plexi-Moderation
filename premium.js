
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const commands = [
    new SlashCommandBuilder()
        .setName('level')
        .setDescription('Check your or someone\'s level')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to check level for')
                .setRequired(false)),

    new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Show server leaderboard'),

    new SlashCommandBuilder()
        .setName('autorole')
        .setDescription('Set automatic role for new members')
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('Role to assign automatically')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('automod')
        .setDescription('Configure auto-moderation settings')
        .addStringOption(option =>
            option.setName('setting')
                .setDescription('Auto-mod setting to configure')
                .setRequired(true)
                .addChoices(
                    { name: 'Anti-Spam', value: 'antispam' },
                    { name: 'Anti-Link', value: 'antilink' },
                    { name: 'Anti-Swear', value: 'antiswear' },
                    { name: 'Anti-Caps', value: 'anticaps' }
                ))
        .addBooleanOption(option =>
            option.setName('enabled')
                .setDescription('Enable or disable this setting')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('slowmode')
        .setDescription('Set slowmode for the current channel')
        .addIntegerOption(option =>
            option.setName('seconds')
                .setDescription('Slowmode duration in seconds (0 to disable)')
                .setRequired(true)
                .setMinValue(0)
                .setMaxValue(21600)),

    new SlashCommandBuilder()
        .setName('lock')
        .setDescription('Lock a channel')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Channel to lock')
                .setRequired(false)),

    new SlashCommandBuilder()
        .setName('unlock')
        .setDescription('Unlock a channel')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Channel to unlock')
                .setRequired(false)),

    new SlashCommandBuilder()
        .setName('warnings')
        .setDescription('View warnings for a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to check warnings for')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('clearwarns')
        .setDescription('Clear all warnings for a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to clear warnings for')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Delete multiple messages')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Number of messages to delete (1-100)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100))
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Only delete messages from this user')
                .setRequired(false)),
];

const handle = {
    level: async (interaction, { client, db }) => {
        const targetUser = interaction.options.getUser('user') || interaction.user;

        try {
            const userData = await db.collection('user_data').findOne({
                userId: targetUser.id,
                guildId: interaction.guild.id
            });

            const level = userData?.level || 1;
            const xp = userData?.xp || 0;
            const xpNeeded = (level * 100) - xp;
            const messageCount = userData?.messageCount || 0;

            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle(`📊 ${targetUser.username}'s Level`)
                .setThumbnail(targetUser.displayAvatarURL())
                .addFields(
                    { name: 'Level', value: level.toString(), inline: true },
                    { name: 'XP', value: xp.toString(), inline: true },
                    { name: 'XP to Next Level', value: xpNeeded.toString(), inline: true },
                    { name: 'Messages Sent', value: messageCount.toString(), inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({ content: '❌ Error fetching user data!', ephemeral: true });
        }
    },

    leaderboard: async (interaction, { client, db }) => {
        try {
            const topUsers = await db.collection('user_data')
                .find({ guildId: interaction.guild.id })
                .sort({ xp: -1 })
                .limit(10)
                .toArray();

            if (topUsers.length === 0) {
                return await interaction.reply({ content: '❌ No user data found!', ephemeral: true });
            }

            let leaderboardText = '';
            for (let i = 0; i < topUsers.length; i++) {
                const user = await client.users.fetch(topUsers[i].userId).catch(() => null);
                if (user) {
                    leaderboardText += `**${i + 1}.** ${user.username} - Level ${topUsers[i].level} (${topUsers[i].xp} XP)\n`;
                }
            }

            const embed = new EmbedBuilder()
                .setColor('#ffd700')
                .setTitle('🏆 Server Leaderboard')
                .setDescription(leaderboardText)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({ content: '❌ Error fetching leaderboard!', ephemeral: true });
        }
    },

    autorole: async (interaction, { serverConfigs, saveServerConfig }) => {
        if (!interaction.member.permissions.has('ManageRoles')) {
            return await interaction.reply({ content: '❌ You need Manage Roles permissions!', ephemeral: true });
        }

        const role = interaction.options.getRole('role');
        const config = serverConfigs.get(interaction.guild.id) || {};
        config.autoRole = role.id;
        serverConfigs.set(interaction.guild.id, config);
        await saveServerConfig(interaction.guild.id, config);

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('✅ Auto Role Set')
            .setDescription(`New members will automatically receive the ${role} role.`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    automod: async (interaction, { serverConfigs, saveServerConfig }) => {
        if (!interaction.member.permissions.has('ManageGuild')) {
            return await interaction.reply({ content: '❌ You need Manage Server permissions!', ephemeral: true });
        }

        const setting = interaction.options.getString('setting');
        const enabled = interaction.options.getBoolean('enabled');

        const config = serverConfigs.get(interaction.guild.id) || {};
        if (!config.automod) config.automod = {};
        config.automod[setting] = enabled;

        serverConfigs.set(interaction.guild.id, config);
        await saveServerConfig(interaction.guild.id, config);

        const embed = new EmbedBuilder()
            .setColor(enabled ? '#00ff00' : '#ff0000')
            .setTitle('⚙️ Auto-Moderation Updated')
            .setDescription(`${setting} has been ${enabled ? 'enabled' : 'disabled'}.`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    slowmode: async (interaction, { logAction }) => {
        if (!interaction.member.permissions.has('ManageChannels')) {
            return await interaction.reply({ content: '❌ You need Manage Channels permissions!', ephemeral: true });
        }

        const seconds = interaction.options.getInteger('seconds');

        try {
            await interaction.channel.setRateLimitPerUser(seconds);

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('⏰ Slowmode Updated')
                .setDescription(`Slowmode set to ${seconds === 0 ? 'disabled' : `${seconds} seconds`}.`)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
            logAction(interaction.guild, `Slowmode set to ${seconds}s in ${interaction.channel.name} by ${interaction.user.tag}`);
        } catch (error) {
            await interaction.reply({ content: '❌ Failed to set slowmode!', ephemeral: true });
        }
    },

    lock: async (interaction, { logAction }) => {
        if (!interaction.member.permissions.has('ManageChannels')) {
            return await interaction.reply({ content: '❌ You need Manage Channels permissions!', ephemeral: true });
        }

        const channel = interaction.options.getChannel('channel') || interaction.channel;

        try {
            await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                SendMessages: false
            });

            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('🔒 Channel Locked')
                .setDescription(`${channel} has been locked.`)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
            logAction(interaction.guild, `Channel ${channel.name} locked by ${interaction.user.tag}`);
        } catch (error) {
            await interaction.reply({ content: '❌ Failed to lock channel!', ephemeral: true });
        }
    },

    unlock: async (interaction, { logAction }) => {
        if (!interaction.member.permissions.has('ManageChannels')) {
            return await interaction.reply({ content: '❌ You need Manage Channels permissions!', ephemeral: true });
        }

        const channel = interaction.options.getChannel('channel') || interaction.channel;

        try {
            await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                SendMessages: null
            });

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('🔓 Channel Unlocked')
                .setDescription(`${channel} has been unlocked.`)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
            logAction(interaction.guild, `Channel ${channel.name} unlocked by ${interaction.user.tag}`);
        } catch (error) {
            await interaction.reply({ content: '❌ Failed to unlock channel!', ephemeral: true });
        }
    },

    warnings: async (interaction, { client, db }) => {
        if (!interaction.member.permissions.has('ManageMessages')) {
            return await interaction.reply({ content: '❌ You need Manage Messages permissions!', ephemeral: true });
        }

        const user = interaction.options.getUser('user');

        try {
            const warnings = await db.collection('warnings')
                .find({ userId: user.id, guildId: interaction.guild.id })
                .sort({ timestamp: -1 })
                .limit(10)
                .toArray();

            if (warnings.length === 0) {
                return await interaction.reply({ content: `❌ No warnings found for ${user.tag}!`, ephemeral: true });
            }

            let warningText = '';
            for (let i = 0; i < warnings.length; i++) {
                const moderator = await client.users.fetch(warnings[i].moderator).catch(() => null);
                warningText += `**${i + 1}.** ${warnings[i].reason}\n*By ${moderator?.tag || 'Unknown'} - <t:${Math.floor(warnings[i].timestamp.getTime() / 1000)}:R>*\n\n`;
            }

            const embed = new EmbedBuilder()
                .setColor('#ff9900')
                .setTitle(`⚠️ Warnings for ${user.username}`)
                .setDescription(warningText)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({ content: '❌ Failed to fetch warnings!', ephemeral: true });
        }
    },

    clearwarns: async (interaction, { db, logModerationAction }) => {
        if (!interaction.member.permissions.has('ManageMessages')) {
            return await interaction.reply({ content: '❌ You need Manage Messages permissions!', ephemeral: true });
        }

        const user = interaction.options.getUser('user');

        try {
            const result = await db.collection('warnings').deleteMany({
                userId: user.id,
                guildId: interaction.guild.id
            });

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('🗑️ Warnings Cleared')
                .setDescription(`Cleared ${result.deletedCount} warnings for ${user.tag}.`)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
            await logModerationAction(interaction.guild.id, 'clearwarns', interaction.user.id, user.id, `Cleared ${result.deletedCount} warnings`);
        } catch (error) {
            await interaction.reply({ content: '❌ Failed to clear warnings!', ephemeral: true });
        }
    },

    purge: async (interaction, { logAction }) => {
        if (!interaction.member.permissions.has('ManageMessages')) {
            return await interaction.reply({ content: '❌ You need Manage Messages permissions!', ephemeral: true });
        }

        const amount = interaction.options.getInteger('amount');
        const targetUser = interaction.options.getUser('user');

        try {
            const messages = await interaction.channel.messages.fetch({ limit: 100 });
            let messagesToDelete = messages.filter(msg => {
                const isNotOld = Date.now() - msg.createdTimestamp < 14 * 24 * 60 * 60 * 1000;
                return targetUser ? (msg.author.id === targetUser.id && isNotOld) : isNotOld;
            }).first(amount);

            await interaction.channel.bulkDelete(messagesToDelete);

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('🗑️ Messages Purged')
                .setDescription(`Successfully deleted ${messagesToDelete.length} messages${targetUser ? ` from ${targetUser.tag}` : ''}.`)
                .setTimestamp();

            const reply = await interaction.reply({ embeds: [embed], fetchReply: true });
            setTimeout(() => reply.delete().catch(() => {}), 5000);

            logAction(interaction.guild, `Purged ${messagesToDelete.length} messages in ${interaction.channel.name} by ${interaction.user.tag}`);
        } catch (error) {
            await interaction.reply({ content: '❌ Failed to purge messages!', ephemeral: true });
        }
    }
};

module.exports = { commands, handle };
