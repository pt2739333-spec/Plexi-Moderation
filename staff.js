
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const commands = [
    new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a member from the server')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to kick')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for kick')
                .setRequired(false)),

    new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a member from the server')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to ban')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for ban')
                .setRequired(false)),

    new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Timeout a member')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to timeout')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('duration')
                .setDescription('Timeout duration in minutes')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for timeout')
                .setRequired(false)),

    new SlashCommandBuilder()
        .setName('setlogchannel')
        .setDescription('Set the logging channel')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Channel for logging')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('addnote')
        .setDescription('Adds an admin note on someone\'s account')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to add note to')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('note')
                .setDescription('Note to add')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('viewnotes')
        .setDescription('Shows all notes linked to a user from this server')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to view notes for')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Restricts a user from sending messages')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to mute')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('duration')
                .setDescription('Duration in minutes')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for mute')
                .setRequired(false)),

    new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('Removes a user\'s muted status earlier')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to unmute')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for unmute')
                .setRequired(false)),

    new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warn a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to warn')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for warning')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('suggest')
        .setDescription('Make a suggestion')
        .addStringOption(option =>
            option.setName('suggestion')
                .setDescription('Your suggestion')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('setwelcome')
        .setDescription('Set welcome channel and message')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Channel for welcome messages')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Welcome message (use {user} for mention, {server} for server name)')
                .setRequired(false)),

    new SlashCommandBuilder()
        .setName('reactionrole')
        .setDescription('Create reaction role message')
        .addStringOption(option =>
            option.setName('title')
                .setDescription('Title of the reaction role message')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('description')
                .setDescription('Description of the reaction role message')
                .setRequired(true)),
];

const handle = {
    kick: async (interaction, { logAction, logModerationAction }) => {
        if (!interaction.member.permissions.has('KickMembers')) {
            return await interaction.reply({ content: '❌ You need Kick Members permissions to use this command!', ephemeral: true });
        }

        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const member = await interaction.guild.members.fetch(user.id);

        if (!member.kickable) {
            return await interaction.reply({ content: '❌ I cannot kick this user!', ephemeral: true });
        }

        try {
            await member.kick(reason);

            const embed = new EmbedBuilder()
                .setColor('#ff6600')
                .setTitle('👢 Member Kicked')
                .addFields(
                    { name: 'User', value: `${user.tag}`, inline: true },
                    { name: 'Moderator', value: `<@${interaction.user.id}>`, inline: true },
                    { name: 'Reason', value: reason }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
            logAction(interaction.guild, `${user.tag} was kicked by ${interaction.user.tag}. Reason: ${reason}`);
        } catch (error) {
            await interaction.reply({ content: '❌ Failed to kick the user!', ephemeral: true });
        }
    },

    ban: async (interaction, { logAction, logModerationAction }) => {
        if (!interaction.member.permissions.has('BanMembers')) {
            return await interaction.reply({ content: '❌ You need Ban Members permissions to use this command!', ephemeral: true });
        }

        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        if (member && !member.bannable) {
            return await interaction.reply({ content: '❌ I cannot ban this user!', ephemeral: true });
        }

        try {
            await interaction.guild.members.ban(user, { reason });

            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('🔨 Member Banned')
                .addFields(
                    { name: 'User', value: `${user.tag}`, inline: true },
                    { name: 'Moderator', value: `<@${interaction.user.id}>`, inline: true },
                    { name: 'Reason', value: reason }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
            logAction(interaction.guild, `${user.tag} was banned by ${interaction.user.tag}. Reason: ${reason}`);
        } catch (error) {
            await interaction.reply({ content: '❌ Failed to ban the user!', ephemeral: true });
        }
    },

    timeout: async (interaction, { logAction, logModerationAction }) => {
        if (!interaction.member.permissions.has('ModerateMembers')) {
            return await interaction.reply({ content: '❌ You need Moderate Members permissions to use this command!', ephemeral: true });
        }

        const user = interaction.options.getUser('user');
        const duration = interaction.options.getInteger('duration');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const member = await interaction.guild.members.fetch(user.id);

        if (!member.moderatable) {
            return await interaction.reply({ content: '❌ I cannot timeout this user!', ephemeral: true });
        }

        try {
            await member.timeout(duration * 60 * 1000, reason);

            const embed = new EmbedBuilder()
                .setColor('#ff9900')
                .setTitle('⏰ Member Timed Out')
                .addFields(
                    { name: 'User', value: `${user.tag}`, inline: true },
                    { name: 'Duration', value: `${duration} minutes`, inline: true },
                    { name: 'Moderator', value: `<@${interaction.user.id}>`, inline: true },
                    { name: 'Reason', value: reason }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
            logAction(interaction.guild, `${user.tag} was timed out for ${duration} minutes by ${interaction.user.tag}. Reason: ${reason}`);
        } catch (error) {
            await interaction.reply({ content: '❌ Failed to timeout the user!', ephemeral: true });
        }
    },

    setlogchannel: async (interaction, { serverConfigs, saveServerConfig }) => {
        if (!interaction.member.permissions.has('ManageGuild')) {
            return await interaction.reply({ content: '❌ You need Manage Server permissions to use this command!', ephemeral: true });
        }

        const channel = interaction.options.getChannel('channel');

        const config = serverConfigs.get(interaction.guild.id) || {};
        config.logChannel = channel.id;
        serverConfigs.set(interaction.guild.id, config);
        await saveServerConfig(interaction.guild.id, config);

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('✅ Logging Channel Set')
            .setDescription(`Log channel has been set to <#${channel.id}>`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    addnote: async (interaction, { db, logAction }) => {
        if (!interaction.member.permissions.has('ManageMessages')) {
            return await interaction.reply({ content: '❌ You need Manage Messages permissions!', ephemeral: true });
        }

        const user = interaction.options.getUser('user');
        const note = interaction.options.getString('note');

        try {
            await db.collection('user_notes').insertOne({
                userId: user.id,
                guildId: interaction.guild.id,
                moderator: interaction.user.id,
                note: note,
                timestamp: new Date()
            });

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('📝 Note Added')
                .addFields(
                    { name: 'User', value: user.tag, inline: true },
                    { name: 'Moderator', value: interaction.user.tag, inline: true },
                    { name: 'Note', value: note }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
            logAction(interaction.guild, `Note added to ${user.tag} by ${interaction.user.tag}: ${note}`);
        } catch (error) {
            await interaction.reply({ content: '❌ Failed to add note!', ephemeral: true });
        }
    },

    viewnotes: async (interaction, { client, db }) => {
        if (!interaction.member.permissions.has('ManageMessages')) {
            return await interaction.reply({ content: '❌ You need Manage Messages permissions!', ephemeral: true });
        }

        const user = interaction.options.getUser('user');

        try {
            const notes = await db.collection('user_notes')
                .find({ userId: user.id, guildId: interaction.guild.id })
                .sort({ timestamp: -1 })
                .limit(10)
                .toArray();

            if (notes.length === 0) {
                return await interaction.reply({ content: `❌ No notes found for ${user.tag}!`, ephemeral: true });
            }

            let noteText = '';
            for (let i = 0; i < notes.length; i++) {
                const moderator = await client.users.fetch(notes[i].moderator).catch(() => null);
                noteText += `**${i + 1}.** ${notes[i].note}\n*By ${moderator?.tag || 'Unknown'} - <t:${Math.floor(notes[i].timestamp.getTime() / 1000)}:R>*\n\n`;
            }

            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle(`📝 Notes for ${user.username}`)
                .setDescription(noteText)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({ content: '❌ Failed to fetch notes!', ephemeral: true });
        }
    },

    mute: async (interaction, { logModerationAction }) => {
        if (!interaction.member.permissions.has('ModerateMembers')) {
            return await interaction.reply({ content: '❌ You need Moderate Members permissions!', ephemeral: true });
        }

        const user = interaction.options.getUser('user');
        const duration = interaction.options.getInteger('duration') || 60;
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const member = await interaction.guild.members.fetch(user.id);

        if (!member.moderatable) {
            return await interaction.reply({ content: '❌ I cannot mute this user!', ephemeral: true });
        }

        try {
            await member.timeout(duration * 60 * 1000, reason);

            const embed = new EmbedBuilder()
                .setColor('#ff9900')
                .setTitle('🔇 Member Muted')
                .addFields(
                    { name: 'User', value: user.tag, inline: true },
                    { name: 'Duration', value: `${duration} minutes`, inline: true },
                    { name: 'Moderator', value: interaction.user.tag, inline: true },
                    { name: 'Reason', value: reason }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
            await logModerationAction(interaction.guild.id, 'mute', interaction.user.id, user.id, reason);
        } catch (error) {
            await interaction.reply({ content: '❌ Failed to mute user!', ephemeral: true });
        }
    },

    unmute: async (interaction, { logModerationAction }) => {
        if (!interaction.member.permissions.has('ModerateMembers')) {
            return await interaction.reply({ content: '❌ You need Moderate Members permissions!', ephemeral: true });
        }

        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const member = await interaction.guild.members.fetch(user.id);

        try {
            await member.timeout(null, reason);

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('🔊 Member Unmuted')
                .addFields(
                    { name: 'User', value: user.tag, inline: true },
                    { name: 'Moderator', value: interaction.user.tag, inline: true },
                    { name: 'Reason', value: reason }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
            await logModerationAction(interaction.guild.id, 'unmute', interaction.user.id, user.id, reason);
        } catch (error) {
            await interaction.reply({ content: '❌ Failed to unmute user!', ephemeral: true });
        }
    },

    warn: async (interaction, { db, logModerationAction }) => {
        if (!interaction.member.permissions.has('ManageMessages')) {
            return await interaction.reply({ content: '❌ You need Manage Messages permissions!', ephemeral: true });
        }

        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');

        try {
            // Save warning to database
            await db.collection('warnings').insertOne({
                userId: user.id,
                guildId: interaction.guild.id,
                moderator: interaction.user.id,
                reason: reason,
                timestamp: new Date()
            });

            const embed = new EmbedBuilder()
                .setColor('#ff9900')
                .setTitle('⚠️ User Warned')
                .addFields(
                    { name: 'User', value: `${user.tag}`, inline: true },
                    { name: 'Moderator', value: `<@${interaction.user.id}>`, inline: true },
                    { name: 'Reason', value: reason }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
            await logModerationAction(interaction.guild.id, 'warn', interaction.user.id, user.id, reason);
        } catch (error) {
            await interaction.reply({ content: '❌ Failed to warn user!', ephemeral: true });
        }
    },

    suggest: async (interaction, { logAction }) => {
        const { saveSuggestion } = require('../bot.js');
        const suggestion = interaction.options.getString('suggestion');

        const embed = new EmbedBuilder()
            .setColor('#ffff00')
            .setTitle('💡 New Suggestion')
            .setDescription(suggestion)
            .addFields(
                { name: 'Author', value: `<@${interaction.user.id}>`, inline: true },
                { name: 'Status', value: '⏳ Pending', inline: true }
            )
            .setTimestamp();

        const message = await interaction.reply({ embeds: [embed], fetchReply: true });
        await message.react('👍');
        await message.react('👎');

        // Save suggestion to database
        await saveSuggestion(interaction.guild.id, interaction.user.id, suggestion, message.id);
        logAction(interaction.guild, `New suggestion by ${interaction.user.tag}: ${suggestion}`);
    },

    setwelcome: async (interaction, { serverConfigs, saveServerConfig }) => {
        if (!interaction.member.permissions.has('ManageGuild')) {
            return await interaction.reply({ content: '❌ You need Manage Server permissions to use this command!', ephemeral: true });
        }

        const channel = interaction.options.getChannel('channel');
        const message = interaction.options.getString('message');

        const config = serverConfigs.get(interaction.guild.id) || {};
        config.welcomeChannel = channel.id;
        if (message) config.welcomeMessage = message;
        serverConfigs.set(interaction.guild.id, config);
        await saveServerConfig(interaction.guild.id, config);

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('✅ Welcome Settings Updated')
            .addFields(
                { name: 'Channel', value: `<#${channel.id}>` },
                { name: 'Message', value: message || 'Welcome {user} to {server}! 🎉' }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    reactionrole: async (interaction) => {
        if (!interaction.member.permissions.has('ManageRoles')) {
            return await interaction.reply({ content: '❌ You need Manage Roles permissions to use this command!', ephemeral: true });
        }

        const title = interaction.options.getString('title');
        const description = interaction.options.getString('description');

        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle(title)
            .setDescription(`${description}\n\nReact with:\n🎮 for Gamer\n🎵 for Music Lover\n📚 for Reader\n💻 for Developer`)
            .setTimestamp();

        const message = await interaction.reply({ embeds: [embed], fetchReply: true });

        // Add reactions
        const reactions = ['🎮', '🎵', '📚', '💻'];
        for (const reaction of reactions) {
            await message.react(reaction);
        }
    }
};

module.exports = { commands, handle };
