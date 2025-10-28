
const { SlashCommandBuilder, EmbedBuilder, WebhookClient, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

const commands = [
    new SlashCommandBuilder()
        .setName('setwebhook')
        .setDescription('Set up webhook for advanced logging')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Channel to create webhook in')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Webhook name')
                .setRequired(false)),

    new SlashCommandBuilder()
        .setName('webhooklog')
        .setDescription('Configure webhook logging settings')
        .addStringOption(option =>
            option.setName('event')
                .setDescription('Event to log')
                .setRequired(true)
                .addChoices(
                    { name: 'Message Delete', value: 'messageDelete' },
                    { name: 'Message Edit', value: 'messageUpdate' },
                    { name: 'Member Join', value: 'memberJoin' },
                    { name: 'Member Leave', value: 'memberLeave' },
                    { name: 'Role Changes', value: 'roleUpdate' },
                    { name: 'Channel Changes', value: 'channelUpdate' },
                    { name: 'Voice Activity', value: 'voiceUpdate' },
                    { name: 'Moderation Actions', value: 'moderation' }
                ))
        .addBooleanOption(option =>
            option.setName('enabled')
                .setDescription('Enable or disable this logging event')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('embed')
        .setDescription('Create a custom embed message')
        .addStringOption(option =>
            option.setName('title')
                .setDescription('Embed title')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('description')
                .setDescription('Embed description')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('color')
                .setDescription('Embed color (hex code)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('footer')
                .setDescription('Embed footer text')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('image')
                .setDescription('Image URL')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('thumbnail')
                .setDescription('Thumbnail URL')
                .setRequired(false)),

    new SlashCommandBuilder()
        .setName('embedbuilder')
        .setDescription('Open interactive embed builder'),

    new SlashCommandBuilder()
        .setName('sendembed')
        .setDescription('Send a saved embed to a channel')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Channel to send embed to')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('embed_id')
                .setDescription('Saved embed ID')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('listembeds')
        .setDescription('List all saved embeds'),

    new SlashCommandBuilder()
        .setName('deleteembed')
        .setDescription('Delete a saved embed')
        .addStringOption(option =>
            option.setName('embed_id')
                .setDescription('Embed ID to delete')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('webhookinfo')
        .setDescription('View webhook configuration for this server'),

    new SlashCommandBuilder()
        .setName('testwebhook')
        .setDescription('Send a test message through the webhook')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Test message content')
                .setRequired(false)),
];

const handle = {
    setwebhook: async (interaction, { serverConfigs, saveServerConfig, db }) => {
        if (!interaction.member.permissions.has('ManageWebhooks')) {
            return await interaction.reply({ content: '❌ You need Manage Webhooks permissions!', ephemeral: true });
        }

        const channel = interaction.options.getChannel('channel');
        const name = interaction.options.getString('name') || 'Advanced Logger';

        try {
            const webhook = await channel.createWebhook({
                name: name,
                avatar: interaction.client.user.displayAvatarURL(),
                reason: `Advanced logging webhook created by ${interaction.user.tag}`
            });

            const config = serverConfigs.get(interaction.guild.id) || {};
            config.webhook = {
                id: webhook.id,
                token: webhook.token,
                channelId: channel.id,
                name: name,
                events: {}
            };
            serverConfigs.set(interaction.guild.id, config);
            await saveServerConfig(interaction.guild.id, config);

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('✅ Webhook Created')
                .setDescription(`Advanced logging webhook "${name}" has been created in ${channel}`)
                .addFields(
                    { name: 'Webhook ID', value: webhook.id, inline: true },
                    { name: 'Channel', value: channel.toString(), inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error creating webhook:', error);
            await interaction.reply({ content: '❌ Failed to create webhook! Make sure I have the necessary permissions.', ephemeral: true });
        }
    },

    webhooklog: async (interaction, { serverConfigs, saveServerConfig }) => {
        if (!interaction.member.permissions.has('ManageGuild')) {
            return await interaction.reply({ content: '❌ You need Manage Server permissions!', ephemeral: true });
        }

        const event = interaction.options.getString('event');
        const enabled = interaction.options.getBoolean('enabled');

        const config = serverConfigs.get(interaction.guild.id) || {};
        if (!config.webhook) {
            return await interaction.reply({ content: '❌ No webhook configured! Use `/setwebhook` first.', ephemeral: true });
        }

        config.webhook.events[event] = enabled;
        serverConfigs.set(interaction.guild.id, config);
        await saveServerConfig(interaction.guild.id, config);

        const embed = new EmbedBuilder()
            .setColor(enabled ? '#00ff00' : '#ff0000')
            .setTitle(`${enabled ? '✅' : '❌'} Webhook Logging Updated`)
            .setDescription(`${event} logging has been ${enabled ? 'enabled' : 'disabled'}`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    embed: async (interaction) => {
        if (!interaction.member.permissions.has('ManageMessages')) {
            return await interaction.reply({ content: '❌ You need Manage Messages permissions!', ephemeral: true });
        }

        const title = interaction.options.getString('title');
        const description = interaction.options.getString('description');
        const color = interaction.options.getString('color');
        const footer = interaction.options.getString('footer');
        const image = interaction.options.getString('image');
        const thumbnail = interaction.options.getString('thumbnail');

        if (!title && !description) {
            return await interaction.reply({ content: '❌ You must provide at least a title or description!', ephemeral: true });
        }

        const embed = new EmbedBuilder();

        if (title) embed.setTitle(title);
        if (description) embed.setDescription(description);
        
        // Default to red if no color provided
        if (color) {
            const validColor = color.startsWith('#') ? color : `#${color}`;
            embed.setColor(validColor);
        } else {
            embed.setColor('#FF0000'); // Red default
        }
        
        if (footer) embed.setFooter({ text: footer });
        if (image) embed.setImage(image);
        if (thumbnail) embed.setThumbnail(thumbnail);
        
        embed.setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    embedbuilder: async (interaction) => {
        if (!interaction.member.permissions.has('ManageMessages')) {
            return await interaction.reply({ content: '❌ You need Manage Messages permissions!', ephemeral: true });
        }

        const modal = new ModalBuilder()
            .setCustomId('embed_builder_modal')
            .setTitle('Interactive Embed Builder');

        const titleInput = new TextInputBuilder()
            .setCustomId('embed_title')
            .setLabel('Embed Title')
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
            .setMaxLength(256);

        const descriptionInput = new TextInputBuilder()
            .setCustomId('embed_description')
            .setLabel('Embed Description')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false)
            .setMaxLength(4000);

        const colorInput = new TextInputBuilder()
            .setCustomId('embed_color')
            .setLabel('Embed Color (hex code)')
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
            .setPlaceholder('#5865F2');

        const footerInput = new TextInputBuilder()
            .setCustomId('embed_footer')
            .setLabel('Embed Footer')
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
            .setMaxLength(2048);

        const imageInput = new TextInputBuilder()
            .setCustomId('embed_image')
            .setLabel('Image URL')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        modal.addComponents(
            new ActionRowBuilder().addComponents(titleInput),
            new ActionRowBuilder().addComponents(descriptionInput),
            new ActionRowBuilder().addComponents(colorInput),
            new ActionRowBuilder().addComponents(footerInput),
            new ActionRowBuilder().addComponents(imageInput)
        );

        await interaction.showModal(modal);
    },

    sendembed: async (interaction, { db }) => {
        if (!interaction.member.permissions.has('ManageMessages')) {
            return await interaction.reply({ content: '❌ You need Manage Messages permissions!', ephemeral: true });
        }

        const channel = interaction.options.getChannel('channel');
        const embedId = interaction.options.getString('embed_id');

        try {
            const savedEmbed = await db.collection('saved_embeds').findOne({
                embedId: embedId,
                guildId: interaction.guild.id
            });

            if (!savedEmbed) {
                return await interaction.reply({ content: '❌ Embed not found! Use `/listembeds` to see available embeds.', ephemeral: true });
            }

            const embed = new EmbedBuilder(savedEmbed.embedData);
            await channel.send({ embeds: [embed] });

            await interaction.reply({ content: `✅ Embed sent to ${channel}!`, ephemeral: true });
        } catch (error) {
            console.error('Error sending embed:', error);
            await interaction.reply({ content: '❌ Failed to send embed! Make sure the channel exists and I have permissions.', ephemeral: true });
        }
    },

    listembeds: async (interaction, { db }) => {
        try {
            const embeds = await db.collection('saved_embeds')
                .find({ guildId: interaction.guild.id })
                .sort({ createdAt: -1 })
                .limit(10)
                .toArray();

            if (embeds.length === 0) {
                return await interaction.reply({ content: '❌ No saved embeds found!', ephemeral: true });
            }

            const embedList = embeds.map((embed, index) => {
                return `**${index + 1}.** ID: \`${embed.embedId}\` - ${embed.embedData.title || 'No Title'} (Created: <t:${Math.floor(embed.createdAt.getTime() / 1000)}:R>)`;
            }).join('\n');

            const listEmbed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('📋 Saved Embeds')
                .setDescription(embedList)
                .setTimestamp();

            await interaction.reply({ embeds: [listEmbed], ephemeral: true });
        } catch (error) {
            await interaction.reply({ content: '❌ Failed to fetch embeds!', ephemeral: true });
        }
    },

    deleteembed: async (interaction, { db }) => {
        if (!interaction.member.permissions.has('ManageMessages')) {
            return await interaction.reply({ content: '❌ You need Manage Messages permissions!', ephemeral: true });
        }

        const embedId = interaction.options.getString('embed_id');

        try {
            const result = await db.collection('saved_embeds').deleteOne({
                embedId: embedId,
                guildId: interaction.guild.id
            });

            if (result.deletedCount === 0) {
                return await interaction.reply({ content: '❌ Embed not found!', ephemeral: true });
            }

            await interaction.reply({ content: `✅ Embed \`${embedId}\` has been deleted!`, ephemeral: true });
        } catch (error) {
            await interaction.reply({ content: '❌ Failed to delete embed!', ephemeral: true });
        }
    },

    webhookinfo: async (interaction, { serverConfigs }) => {
        const config = serverConfigs.get(interaction.guild.id) || {};

        if (!config.webhook) {
            return await interaction.reply({ content: '❌ No webhook configured for this server!', ephemeral: true });
        }

        const events = config.webhook.events || {};
        const enabledEvents = Object.entries(events)
            .filter(([event, enabled]) => enabled)
            .map(([event]) => event)
            .join(', ') || 'None';

        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('🔗 Webhook Information')
            .addFields(
                { name: 'Webhook Name', value: config.webhook.name, inline: true },
                { name: 'Channel', value: `<#${config.webhook.channelId}>`, inline: true },
                { name: 'Webhook ID', value: config.webhook.id, inline: true },
                { name: 'Enabled Events', value: enabledEvents, inline: false }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
    },

    testwebhook: async (interaction, { serverConfigs }) => {
        if (!interaction.member.permissions.has('ManageWebhooks')) {
            return await interaction.reply({ content: '❌ You need Manage Webhooks permissions!', ephemeral: true });
        }

        const config = serverConfigs.get(interaction.guild.id) || {};
        if (!config.webhook) {
            return await interaction.reply({ content: '❌ No webhook configured!', ephemeral: true });
        }

        const message = interaction.options.getString('message') || 'This is a test webhook message!';

        try {
            const webhook = new WebhookClient({ id: config.webhook.id, token: config.webhook.token });

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('🧪 Webhook Test')
                .setDescription(message)
                .addFields(
                    { name: 'Tested by', value: interaction.user.tag, inline: true },
                    { name: 'Test Time', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
                )
                .setFooter({ text: 'Advanced Logging System', iconURL: interaction.client.user.displayAvatarURL() })
                .setTimestamp();

            await webhook.send({ embeds: [embed] });
            await interaction.reply({ content: '✅ Test webhook message sent successfully!', ephemeral: true });
        } catch (error) {
            console.error('Webhook test error:', error);
            await interaction.reply({ content: '❌ Failed to send test webhook message!', ephemeral: true });
        }
    }
};

module.exports = { commands, handle };
