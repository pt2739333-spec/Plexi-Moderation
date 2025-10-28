
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const commands = [
    new SlashCommandBuilder()
        .setName('setwelcomechannel')
        .setDescription('Sets a custom channel where newcomers will receive a welcome message')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Channel for welcome messages')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('setleavechannel')
        .setDescription('Sets a custom channel where leaving members will be logged')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Channel for leave messages')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('welcomemessage')
        .setDescription('Sets a custom welcome message')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Welcome message (use {user} for mention, {server} for server name)')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('leavemessage')
        .setDescription('Sets a custom goodbye message for those leaving the server')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Leave message (use {user} for username, {server} for server name)')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('welcomedm')
        .setDescription('Sets a custom welcome message that will be DMed to new users')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Welcome DM message')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('welcomerole')
        .setDescription('Sets a role to be assigned to new users when they join')
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('Role to assign to new members')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('togglewelcomemsg')
        .setDescription('Toggles welcome messages on/off'),

    new SlashCommandBuilder()
        .setName('toggleleavemsg')
        .setDescription('Toggles leave messages on/off'),

    new SlashCommandBuilder()
        .setName('togglewelcomedm')
        .setDescription('Toggles welcome DMs on/off'),
];

const handle = {
    setwelcomechannel: async (interaction, { serverConfigs, saveServerConfig }) => {
        if (!interaction.member.permissions.has('ManageGuild')) {
            return await interaction.reply({ content: '❌ You need Manage Server permissions!', ephemeral: true });
        }

        const channel = interaction.options.getChannel('channel');
        const config = serverConfigs.get(interaction.guild.id) || {};
        config.welcomeChannel = channel.id;
        serverConfigs.set(interaction.guild.id, config);
        await saveServerConfig(interaction.guild.id, config);

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('✅ Welcome Channel Set')
            .setDescription(`Welcome channel has been set to <#${channel.id}>`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    setleavechannel: async (interaction, { serverConfigs, saveServerConfig }) => {
        if (!interaction.member.permissions.has('ManageGuild')) {
            return await interaction.reply({ content: '❌ You need Manage Server permissions!', ephemeral: true });
        }

        const channel = interaction.options.getChannel('channel');
        const config = serverConfigs.get(interaction.guild.id) || {};
        config.leaveChannel = channel.id;
        serverConfigs.set(interaction.guild.id, config);
        await saveServerConfig(interaction.guild.id, config);

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('✅ Leave Channel Set')
            .setDescription(`Leave channel has been set to <#${channel.id}>`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    welcomemessage: async (interaction, { serverConfigs, saveServerConfig }) => {
        if (!interaction.member.permissions.has('ManageGuild')) {
            return await interaction.reply({ content: '❌ You need Manage Server permissions!', ephemeral: true });
        }

        const message = interaction.options.getString('message');
        const config = serverConfigs.get(interaction.guild.id) || {};
        config.welcomeMessage = message;
        serverConfigs.set(interaction.guild.id, config);
        await saveServerConfig(interaction.guild.id, config);

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('✅ Welcome Message Set')
            .setDescription(`Welcome message has been set to:\n\n${message}`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    leavemessage: async (interaction, { serverConfigs, saveServerConfig }) => {
        if (!interaction.member.permissions.has('ManageGuild')) {
            return await interaction.reply({ content: '❌ You need Manage Server permissions!', ephemeral: true });
        }

        const message = interaction.options.getString('message');
        const config = serverConfigs.get(interaction.guild.id) || {};
        config.leaveMessage = message;
        serverConfigs.set(interaction.guild.id, config);
        await saveServerConfig(interaction.guild.id, config);

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('✅ Leave Message Set')
            .setDescription(`Leave message has been set to:\n\n${message}`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    welcomedm: async (interaction, { serverConfigs, saveServerConfig }) => {
        if (!interaction.member.permissions.has('ManageGuild')) {
            return await interaction.reply({ content: '❌ You need Manage Server permissions!', ephemeral: true });
        }

        const message = interaction.options.getString('message');
        const config = serverConfigs.get(interaction.guild.id) || {};
        config.welcomeDM = message;
        serverConfigs.set(interaction.guild.id, config);
        await saveServerConfig(interaction.guild.id, config);

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('✅ Welcome DM Set')
            .setDescription(`Welcome DM message has been set to:\n\n${message}`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    welcomerole: async (interaction, { serverConfigs, saveServerConfig }) => {
        if (!interaction.member.permissions.has('ManageGuild')) {
            return await interaction.reply({ content: '❌ You need Manage Server permissions!', ephemeral: true });
        }

        const role = interaction.options.getRole('role');
        const config = serverConfigs.get(interaction.guild.id) || {};
        config.autoRole = role.id;
        serverConfigs.set(interaction.guild.id, config);
        await saveServerConfig(interaction.guild.id, config);

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('✅ Welcome Role Set')
            .setDescription(`New members will automatically receive the ${role} role.`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    togglewelcomemsg: async (interaction, { serverConfigs, saveServerConfig }) => {
        if (!interaction.member.permissions.has('ManageGuild')) {
            return await interaction.reply({ content: '❌ You need Manage Server permissions!', ephemeral: true });
        }

        const config = serverConfigs.get(interaction.guild.id) || {};
        config.welcomeEnabled = !config.welcomeEnabled;
        serverConfigs.set(interaction.guild.id, config);
        await saveServerConfig(interaction.guild.id, config);

        const embed = new EmbedBuilder()
            .setColor(config.welcomeEnabled ? '#00ff00' : '#ff0000')
            .setTitle(`${config.welcomeEnabled ? '✅' : '❌'} Welcome Messages ${config.welcomeEnabled ? 'Enabled' : 'Disabled'}`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    toggleleavemsg: async (interaction, { serverConfigs, saveServerConfig }) => {
        if (!interaction.member.permissions.has('ManageGuild')) {
            return await interaction.reply({ content: '❌ You need Manage Server permissions!', ephemeral: true });
        }

        const config = serverConfigs.get(interaction.guild.id) || {};
        config.leaveEnabled = !config.leaveEnabled;
        serverConfigs.set(interaction.guild.id, config);
        await saveServerConfig(interaction.guild.id, config);

        const embed = new EmbedBuilder()
            .setColor(config.leaveEnabled ? '#00ff00' : '#ff0000')
            .setTitle(`${config.leaveEnabled ? '✅' : '❌'} Leave Messages ${config.leaveEnabled ? 'Enabled' : 'Disabled'}`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    togglewelcomedm: async (interaction, { serverConfigs, saveServerConfig }) => {
        if (!interaction.member.permissions.has('ManageGuild')) {
            return await interaction.reply({ content: '❌ You need Manage Server permissions!', ephemeral: true });
        }

        const config = serverConfigs.get(interaction.guild.id) || {};
        config.welcomeDMEnabled = !config.welcomeDMEnabled;
        serverConfigs.set(interaction.guild.id, config);
        await saveServerConfig(interaction.guild.id, config);

        const embed = new EmbedBuilder()
            .setColor(config.welcomeDMEnabled ? '#00ff00' : '#ff0000')
            .setTitle(`${config.welcomeDMEnabled ? '✅' : '❌'} Welcome DMs ${config.welcomeDMEnabled ? 'Enabled' : 'Disabled'}`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};

module.exports = { commands, handle };
