
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const commands = [
    new SlashCommandBuilder()
        .setName('giverole')
        .setDescription('Adds a role to a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to give role to')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('Role to give')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('takerole')
        .setDescription('Removes a role from a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to take role from')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('Role to take')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('role')
        .setDescription('Manage user roles')
        .addStringOption(option =>
            option.setName('action')
                .setDescription('Action to perform')
                .setRequired(true)
                .addChoices(
                    { name: 'Add', value: 'add' },
                    { name: 'Remove', value: 'remove' }
                ))
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to modify roles for')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('Role to add or remove')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('rolepicker')
        .setDescription('Creates a menu that automatically assigns roles to users')
        .addStringOption(option =>
            option.setName('title')
                .setDescription('Title for the role picker')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('description')
                .setDescription('Description for the role picker')
                .setRequired(true)),
];

const handle = {
    giverole: async (interaction, { logAction }) => {
        if (!interaction.member.permissions.has('ManageRoles')) {
            return await interaction.reply({ content: '❌ You need Manage Roles permissions!', ephemeral: true });
        }

        const user = interaction.options.getUser('user');
        const role = interaction.options.getRole('role');
        const member = await interaction.guild.members.fetch(user.id);

        if (member.roles.cache.has(role.id)) {
            return await interaction.reply({ content: `❌ ${user.tag} already has the ${role.name} role!`, ephemeral: true });
        }

        try {
            await member.roles.add(role);

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('✅ Role Added')
                .addFields(
                    { name: 'User', value: user.tag, inline: true },
                    { name: 'Role', value: role.name, inline: true },
                    { name: 'Moderator', value: interaction.user.tag, inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
            logAction(interaction.guild, `Role ${role.name} added to ${user.tag} by ${interaction.user.tag}`);
        } catch (error) {
            await interaction.reply({ content: '❌ Failed to add role!', ephemeral: true });
        }
    },

    takerole: async (interaction, { logAction }) => {
        if (!interaction.member.permissions.has('ManageRoles')) {
            return await interaction.reply({ content: '❌ You need Manage Roles permissions!', ephemeral: true });
        }

        const user = interaction.options.getUser('user');
        const role = interaction.options.getRole('role');
        const member = await interaction.guild.members.fetch(user.id);

        if (!member.roles.cache.has(role.id)) {
            return await interaction.reply({ content: `❌ ${user.tag} doesn't have the ${role.name} role!`, ephemeral: true });
        }

        try {
            await member.roles.remove(role);

            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Role Removed')
                .addFields(
                    { name: 'User', value: user.tag, inline: true },
                    { name: 'Role', value: role.name, inline: true },
                    { name: 'Moderator', value: interaction.user.tag, inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
            logAction(interaction.guild, `Role ${role.name} removed from ${user.tag} by ${interaction.user.tag}`);
        } catch (error) {
            await interaction.reply({ content: '❌ Failed to remove role!', ephemeral: true });
        }
    },

    role: async (interaction, { logAction }) => {
        if (!interaction.member.permissions.has('ManageRoles')) {
            return await interaction.reply({ content: '❌ You need Manage Roles permissions!', ephemeral: true });
        }

        const action = interaction.options.getString('action');
        const user = interaction.options.getUser('user');
        const role = interaction.options.getRole('role');
        const member = await interaction.guild.members.fetch(user.id);

        try {
            if (action === 'add') {
                if (member.roles.cache.has(role.id)) {
                    return await interaction.reply({ content: `❌ ${user.tag} already has the ${role.name} role!`, ephemeral: true });
                }
                await member.roles.add(role);
                
                const embed = new EmbedBuilder()
                    .setColor('#00ff00')
                    .setTitle('✅ Role Added')
                    .addFields(
                        { name: 'User', value: user.tag, inline: true },
                        { name: 'Role', value: role.name, inline: true },
                        { name: 'Moderator', value: interaction.user.tag, inline: true }
                    )
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
                logAction(interaction.guild, `Role ${role.name} added to ${user.tag} by ${interaction.user.tag}`);
            } else {
                if (!member.roles.cache.has(role.id)) {
                    return await interaction.reply({ content: `❌ ${user.tag} doesn't have the ${role.name} role!`, ephemeral: true });
                }
                await member.roles.remove(role);
                
                const embed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('❌ Role Removed')
                    .addFields(
                        { name: 'User', value: user.tag, inline: true },
                        { name: 'Role', value: role.name, inline: true },
                        { name: 'Moderator', value: interaction.user.tag, inline: true }
                    )
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
                logAction(interaction.guild, `Role ${role.name} removed from ${user.tag} by ${interaction.user.tag}`);
            }
        } catch (error) {
            await interaction.reply({ content: `❌ Failed to ${action} role!`, ephemeral: true });
        }
    },

    rolepicker: async (interaction) => {
        if (!interaction.member.permissions.has('ManageRoles')) {
            return await interaction.reply({ content: '❌ You need Manage Roles permissions!', ephemeral: true });
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
