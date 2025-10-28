const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { MongoClient } = require('mongodb');
require('dotenv').config();

// Bot owner configuration
const OWNER_ID = process.env.OWNER_ID || ''; // Set your Discord user ID in environment variables

// Create Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildModeration,
    ],
});

// Storage for server configurations
const serverConfigs = new Map();

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://Plexidev:costa@plexi.twfm9xt.mongodb.net/?retryWrites=true&w=majority&appName=Plexi';
let mongoClient;
let db;

// Initialize MongoDB connection
async function connectToMongoDB() {
    try {
        mongoClient = new MongoClient(MONGODB_URI);
        await mongoClient.connect();
        db = mongoClient.db('discord_bot');
        console.log('✅ Connected to MongoDB successfully');
        
        // Create collections if they don't exist
        await db.createCollection('server_configs');
        await db.createCollection('user_data');
        await db.createCollection('moderation_logs');
        await db.createCollection('suggestions');
        await db.createCollection('saved_embeds');
        
        // Load server configs from database
        const configs = await db.collection('server_configs').find({}).toArray();
        configs.forEach(config => {
            serverConfigs.set(config.serverId, config);
        });
        console.log(`📂 Loaded ${configs.length} server configurations from database`);
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
    }
}

// Save server config to database
async function saveServerConfig(serverId, config) {
    try {
        await db.collection('server_configs').updateOne(
            { serverId: serverId },
            { $set: { ...config, serverId: serverId, updatedAt: new Date() } },
            { upsert: true }
        );
    } catch (error) {
        console.error('Error saving server config:', error);
    }
}

// Log moderation action to database
async function logModerationAction(guildId, action, moderator, target, reason) {
    try {
        await db.collection('moderation_logs').insertOne({
            guildId: guildId,
            action: action,
            moderator: moderator,
            target: target,
            reason: reason,
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Error logging moderation action:', error);
    }
}

// Save suggestion to database
async function saveSuggestion(guildId, userId, suggestion, messageId) {
    try {
        await db.collection('suggestions').insertOne({
            guildId: guildId,
            userId: userId,
            suggestion: suggestion,
            messageId: messageId,
            status: 'pending',
            upvotes: 0,
            downvotes: 0,
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Error saving suggestion:', error);
    }
}

// Advanced webhook logging function
async function sendWebhookLog(guildId, eventType, logData) {
    try {
        const config = serverConfigs.get(guildId);
        if (!config?.webhook?.events?.[eventType]) return;

        const { WebhookClient } = require('discord.js');
        const webhook = new WebhookClient({ 
            id: config.webhook.id, 
            token: config.webhook.token 
        });

        await webhook.send(logData);
    } catch (error) {
        console.error('Error sending webhook log:', error);
    }
}

// Generate random embed ID
function generateEmbedId() {
    return Math.random().toString(36).substr(2, 9);
}

// Update user data in database
async function updateUserData(userId, guildId, data) {
    try {
        await db.collection('user_data').updateOne(
            { userId: userId, guildId: guildId },
            { $set: { ...data, updatedAt: new Date() } },
            { upsert: true }
        );
    } catch (error) {
        console.error('Error updating user data:', error);
    }
}

// Check if user is bot owner
function isOwner(userId) {
    return userId === OWNER_ID;
}



// Import command handlers
const infoCommands = require('./commands/info');
const funCommands = require('./commands/fun');
const staffCommands = require('./commands/staff');
const premiumCommands = require('./commands/premium');
const roleCommands = require('./commands/role');
const welcomeCommands = require('./commands/welcome');
const debugCommands = require('./commands/debug');
const webhookCommands = require('./commands/webhooks');

// Define slash commands by combining all command modules
const commands = [
    ...infoCommands.commands,
    ...funCommands.commands,
    ...staffCommands.commands,
    ...premiumCommands.commands,
    ...roleCommands.commands,
    ...welcomeCommands.commands,
    ...debugCommands.commands,
    ...webhookCommands.commands
];

// Welcome message and auto-role handler
client.on('guildMemberAdd', async member => {
    const config = serverConfigs.get(member.guild.id);
    
    // Auto-role assignment
    if (config && config.autoRole) {
        try {
            const role = member.guild.roles.cache.get(config.autoRole);
            if (role) {
                await member.roles.add(role);
                logAction(member.guild, `Auto-assigned role ${role.name} to ${member.user.tag}`);
            }
        } catch (error) {
            console.error('Error assigning auto-role:', error);
        }
    }
    
    // Welcome message
    if (!config || !config.welcomeChannel) return;
    
    const channel = member.guild.channels.cache.get(config.welcomeChannel);
    if (!channel) return;
    
    const welcomeMessage = config.welcomeMessage || 'Welcome {user} to {server}! 🎉';
    const message = welcomeMessage
        .replace('{user}', `<@${member.id}>`)
        .replace('{server}', member.guild.name);
    
    const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('👋 Welcome!')
        .setDescription(message)
        .setThumbnail(member.user.displayAvatarURL())
        .setTimestamp();
    
    try {
        await channel.send({ embeds: [embed] });
        logAction(member.guild, `New member joined: ${member.user.tag}`);
        
        // Initialize user data in database
        await updateUserData(member.id, member.guild.id, {
            xp: 0,
            level: 1,
            messageCount: 0,
            joinedAt: new Date()
        });
    } catch (error) {
        console.error('Error sending welcome message:', error);
    }
});

// Enhanced logging events
client.on('messageDelete', async message => {
    if (message.author?.bot) return;

    const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('🗑️ Message Deleted')
        .addFields(
            { name: 'Author', value: message.author?.tag || 'Unknown', inline: true },
            { name: 'Channel', value: `<#${message.channel.id}>`, inline: true },
            { name: 'Content', value: message.content || 'No content', inline: false }
        )
        .setTimestamp();

    await sendWebhookLog(message.guild.id, 'messageDelete', { embeds: [embed] });
});

client.on('messageUpdate', async (oldMessage, newMessage) => {
    if (newMessage.author?.bot || oldMessage.content === newMessage.content) return;

    const embed = new EmbedBuilder()
        .setColor('#ff9900')
        .setTitle('✏️ Message Edited')
        .addFields(
            { name: 'Author', value: newMessage.author.tag, inline: true },
            { name: 'Channel', value: `<#${newMessage.channel.id}>`, inline: true },
            { name: 'Before', value: oldMessage.content || 'No content', inline: false },
            { name: 'After', value: newMessage.content || 'No content', inline: false }
        )
        .setTimestamp();

    await sendWebhookLog(newMessage.guild.id, 'messageUpdate', { embeds: [embed] });
});

client.on('guildMemberRemove', async member => {
    const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('👋 Member Left')
        .addFields(
            { name: 'User', value: member.user.tag, inline: true },
            { name: 'ID', value: member.user.id, inline: true },
            { name: 'Joined', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true }
        )
        .setThumbnail(member.user.displayAvatarURL())
        .setTimestamp();

    await sendWebhookLog(member.guild.id, 'memberLeave', { embeds: [embed] });
});

client.on('voiceStateUpdate', async (oldState, newState) => {
    if (oldState.channelId === newState.channelId) return;

    let title, description, color;
    
    if (!oldState.channelId && newState.channelId) {
        title = '🔊 Voice Channel Joined';
        description = `${newState.member.user.tag} joined <#${newState.channelId}>`;
        color = '#00ff00';
    } else if (oldState.channelId && !newState.channelId) {
        title = '🔇 Voice Channel Left';
        description = `${oldState.member.user.tag} left <#${oldState.channelId}>`;
        color = '#ff0000';
    } else {
        title = '🔄 Voice Channel Moved';
        description = `${newState.member.user.tag} moved from <#${oldState.channelId}> to <#${newState.channelId}>`;
        color = '#ff9900';
    }

    const embed = new EmbedBuilder()
        .setColor(color)
        .setTitle(title)
        .setDescription(description)
        .setTimestamp();

    await sendWebhookLog(newState.guild.id, 'voiceUpdate', { embeds: [embed] });
});

// Auto-moderation and leveling system
client.on('messageCreate', async message => {
    if (message.author.bot) return;
    
    // Level system - give XP for messages
    try {
        const userData = await db.collection('user_data').findOne({ 
            userId: message.author.id, 
            guildId: message.guild.id 
        });
        
        const currentXP = userData ? userData.xp || 0 : 0;
        const currentLevel = userData ? userData.level || 1 : 1;
        const newXP = currentXP + Math.floor(Math.random() * 15) + 5; // 5-20 XP per message
        const newLevel = Math.floor(newXP / 100) + 1;
        
        await updateUserData(message.author.id, message.guild.id, {
            xp: newXP,
            level: newLevel,
            messageCount: (userData?.messageCount || 0) + 1
        });
        
        // Level up notification
        if (newLevel > currentLevel) {
            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('🎉 Level Up!')
                .setDescription(`${message.author} reached level **${newLevel}**!`)
                .setThumbnail(message.author.displayAvatarURL())
                .setTimestamp();
            
            message.channel.send({ embeds: [embed] });
        }
    } catch (error) {
        console.error('Error in leveling system:', error);
    }
    
    const config = serverConfigs.get(message.guild.id) || {};
    const badWords = ['spam', 'scam', 'discord.gg/', 'http://', 'https://'];
    const content = message.content.toLowerCase();
    
    // Auto-moderation checks
    let shouldDelete = false;
    let reason = '';
    
    // Anti-spam
    if (config.automod?.antispam && badWords.some(word => content.includes(word))) {
        shouldDelete = true;
        reason = 'spam/inappropriate links';
    }
    
    // Anti-caps (if more than 70% caps)
    if (config.automod?.anticaps) {
        const capsCount = (content.match(/[A-Z]/g) || []).length;
        const totalLetters = (content.match(/[A-Za-z]/g) || []).length;
        if (totalLetters > 5 && capsCount / totalLetters > 0.7) {
            shouldDelete = true;
            reason = 'excessive caps';
        }
    }
    
    // Anti-swear (basic filter)
    if (config.automod?.antiswear) {
        const swearWords = ['fuck', 'shit', 'damn', 'bitch']; // Basic list
        if (swearWords.some(word => content.includes(word))) {
            shouldDelete = true;
            reason = 'inappropriate language';
        }
    }
    
    if (shouldDelete && !message.member.permissions.has('ManageMessages')) {
        try {
            await message.delete();
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('⚠️ Auto-Moderation')
                .setDescription(`${message.author}, your message was automatically removed for: ${reason}`)
                .setTimestamp();
            
            const warning = await message.channel.send({ embeds: [embed] });
            setTimeout(() => warning.delete().catch(() => {}), 5000);
            
            logAction(message.guild, `Auto-mod: Deleted message from ${message.author.tag} for ${reason}`);
            await logModerationAction(message.guild.id, 'auto-delete', 'System', message.author.id, reason);
        } catch (error) {
            console.error('Error in auto-moderation:', error);
        }
    }
});

// Reaction role handler
client.on('messageReactionAdd', async (reaction, user) => {
    if (user.bot) return;
    
    // Handle partial reactions
    if (reaction.partial) {
        try {
            await reaction.fetch();
        } catch (error) {
            console.error('Error fetching reaction:', error);
            return;
        }
    }
    
    // Example reaction roles (you can customize this)
    const roleMap = {
        '🎮': 'Gamer',
        '🎵': 'Music Lover',
        '📚': 'Reader',
        '💻': 'Developer'
    };
    
    const roleName = roleMap[reaction.emoji.name];
    if (!roleName) return;
    
    const guild = reaction.message.guild;
    const member = await guild.members.fetch(user.id);
    const role = guild.roles.cache.find(r => r.name === roleName);
    
    if (role && !member.roles.cache.has(role.id)) {
        try {
            await member.roles.add(role);
            logAction(guild, `Added role ${roleName} to ${user.tag}`);
        } catch (error) {
            console.error('Error adding role:', error);
        }
    }
});

// Remove role on reaction remove
client.on('messageReactionRemove', async (reaction, user) => {
    if (user.bot) return;
    
    if (reaction.partial) {
        try {
            await reaction.fetch();
        } catch (error) {
            console.error('Error fetching reaction:', error);
            return;
        }
    }
    
    const roleMap = {
        '🎮': 'Gamer',
        '🎵': 'Music Lover',
        '📚': 'Reader',
        '💻': 'Developer'
    };
    
    const roleName = roleMap[reaction.emoji.name];
    if (!roleName) return;
    
    const guild = reaction.message.guild;
    const member = await guild.members.fetch(user.id);
    const role = guild.roles.cache.find(r => r.name === roleName);
    
    if (role && member.roles.cache.has(role.id)) {
        try {
            await member.roles.remove(role);
            logAction(guild, `Removed role ${roleName} from ${user.tag}`);
        } catch (error) {
            console.error('Error removing role:', error);
        }
    }
});

// Logging function
function logAction(guild, action) {
    const config = serverConfigs.get(guild.id);
    if (!config || !config.logChannel) return;
    
    const channel = guild.channels.cache.get(config.logChannel);
    if (!channel) return;
    
    const embed = new EmbedBuilder()
        .setColor('#ffa500')
        .setTitle('📋 Server Log')
        .setDescription(action)
        .setTimestamp();
    
    channel.send({ embeds: [embed] }).catch(console.error);
}

// Bot event handlers
client.once('clientReady', async () => {
    console.log(`✅ Bot is ready! Logged in as ${client.user.tag}`);
    
    // Connect to MongoDB
    await connectToMongoDB();
    
    // Register slash commands
    try {
        const rest = new REST().setToken(process.env.DISCORD_TOKEN);
        console.log('🔄 Started refreshing application (/) commands.');
        
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands },
        );
        
        console.log('✅ Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error('❌ Error registering commands:', error);
    }
});

// Handle all interactions (commands, buttons, modals)
client.on('interactionCreate', async interaction => {
    // Handle modal submissions
    if (interaction.isModalSubmit()) {
        if (interaction.customId === 'embed_builder_modal') {
            try {
                const title = interaction.fields.getTextInputValue('embed_title');
                const description = interaction.fields.getTextInputValue('embed_description');
                const color = interaction.fields.getTextInputValue('embed_color');
                const footer = interaction.fields.getTextInputValue('embed_footer');
                const image = interaction.fields.getTextInputValue('embed_image');

                if (!title && !description) {
                    return await interaction.reply({ content: '❌ You must provide at least a title or description!', ephemeral: true });
                }

                const embed = new EmbedBuilder();

                if (title) embed.setTitle(title);
                if (description) embed.setDescription(description);
                
                if (color) {
                    const validColor = color.startsWith('#') ? color : `#${color}`;
                    embed.setColor(validColor);
                } else {
                    embed.setColor('#FF0000');
                }
                
                if (footer) embed.setFooter({ text: footer });
                if (image) embed.setImage(image);
                
                embed.setTimestamp();

                // Save embed to database
                const embedId = generateEmbedId();
                await db.collection('saved_embeds').insertOne({
                    embedId: embedId,
                    guildId: interaction.guild.id,
                    createdBy: interaction.user.id,
                    embedData: embed.toJSON(),
                    createdAt: new Date()
                });

                await interaction.reply({ 
                    content: `✅ Embed created! ID: \`${embedId}\`\nUse \`/sendembed\` to send it to a channel.`,
                    embeds: [embed],
                    ephemeral: true 
                });
            } catch (error) {
                console.error('Error handling embed builder modal:', error);
                await interaction.reply({ content: '❌ Error creating embed!', ephemeral: true });
            }
        }
        return;
    }

    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    try {
        // Create context object with all needed functions and data
        const context = {
            client,
            db,
            serverConfigs,
            saveServerConfig,
            logAction,
            logModerationAction,
            isOwner,
            OWNER_ID
        };

        // Check each command module for the command
        if (infoCommands.handle[commandName]) {
            await infoCommands.handle[commandName](interaction, context);
            return;
        }

        if (funCommands.handle[commandName]) {
            await funCommands.handle[commandName](interaction, context);
            return;
        }

        if (staffCommands.handle[commandName]) {
            await staffCommands.handle[commandName](interaction, context);
            return;
        }

        if (premiumCommands.handle[commandName]) {
            await premiumCommands.handle[commandName](interaction, context);
            return;
        }

        if (roleCommands.handle[commandName]) {
            await roleCommands.handle[commandName](interaction, context);
            return;
        }

        if (welcomeCommands.handle[commandName]) {
            await welcomeCommands.handle[commandName](interaction, context);
            return;
        }

        if (debugCommands.handle[commandName]) {
            await debugCommands.handle[commandName](interaction, context);
            return;
        }

        if (webhookCommands.handle[commandName]) {
            await webhookCommands.handle[commandName](interaction, context);
            return;
        }

        // If command not found in any module
        await interaction.reply({ content: '❌ Command not found!', ephemeral: true });

    } catch (error) {
        console.error('Error handling interaction:', error);
        const errorReply = { content: '❌ There was an error executing this command!', ephemeral: true };
        
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(errorReply);
        } else {
            await interaction.reply(errorReply);
        }
    }
});

// Handle errors
client.on('error', error => {
    console.error('❌ Discord client error:', error);
});

process.on('unhandledRejection', error => {
    console.error('❌ Unhandled promise rejection:', error);
});

// Gracefully close MongoDB connection on exit
process.on('SIGINT', async () => {
    if (mongoClient) {
        await mongoClient.close();
        console.log('📦 MongoDB connection closed');
    }
    process.exit(0);
});

// Start the Discord bot (only if token is provided)
if (process.env.DISCORD_TOKEN) {
    client.login(process.env.DISCORD_TOKEN);
} else {
    console.log('⚠️  DISCORD_TOKEN not found in environment variables.');
    console.log('📝 Please add your Discord bot token to start the bot functionality.');
}