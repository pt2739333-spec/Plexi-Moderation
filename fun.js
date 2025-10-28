
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const commands = [
    new SlashCommandBuilder()
        .setName('approved')
        .setDescription('Approves your profile picture or someone else\'s')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to approve')
                .setRequired(false)),

    new SlashCommandBuilder()
        .setName('blur')
        .setDescription('Blurs your profile picture or someone else\'s')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to blur avatar of')
                .setRequired(false)),

    new SlashCommandBuilder()
        .setName('dogfact')
        .setDescription('Sends a lovely dog fact'),

    new SlashCommandBuilder()
        .setName('catfact')
        .setDescription('Sends a lovely cat fact'),

    new SlashCommandBuilder()
        .setName('contrast')
        .setDescription('Adds contrast effect to your profile picture or someone else\'s')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to add contrast to avatar of')
                .setRequired(false)),

    new SlashCommandBuilder()
        .setName('deepfry')
        .setDescription('Add deepfried effect to your profile picture or someone else\'s')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to deepfry avatar of')
                .setRequired(false)),

    new SlashCommandBuilder()
        .setName('define')
        .setDescription('Looks up a term in the dictionary')
        .addStringOption(option =>
            option.setName('word')
                .setDescription('Word to define')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('nasanews')
        .setDescription('Looks up an astronomy-related term on NASA\'s Website')
        .addStringOption(option =>
            option.setName('term')
                .setDescription('Astronomy term to look up')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('weather')
        .setDescription('Tells you information about the weather in a given location')
        .addStringOption(option =>
            option.setName('location')
                .setDescription('Location to check weather for')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('yomomma')
        .setDescription('Sends a your mom joke to someone')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to send joke to')
                .setRequired(false)),

    new SlashCommandBuilder()
        .setName('joke')
        .setDescription('Tells a random joke'),

    new SlashCommandBuilder()
        .setName('8ball')
        .setDescription('Ask the Magic 8-Ball a question')
        .addStringOption(option =>
            option.setName('question')
                .setDescription('Your question for the 8-Ball')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('coinflip')
        .setDescription('Flips a coin'),

    new SlashCommandBuilder()
        .setName('dice')
        .setDescription('Rolls a dice')
        .addIntegerOption(option =>
            option.setName('sides')
                .setDescription('Number of sides on the dice (default 6)')
                .setRequired(false)),

    new SlashCommandBuilder()
        .setName('meme')
        .setDescription('Sends a random meme'),

    new SlashCommandBuilder()
        .setName('quote')
        .setDescription('Sends an inspirational quote'),

    new SlashCommandBuilder()
        .setName('riddle')
        .setDescription('Gives you a riddle to solve'),

    new SlashCommandBuilder()
        .setName('trivia')
        .setDescription('Asks a trivia question'),

    new SlashCommandBuilder()
        .setName('roast')
        .setDescription('Gives a friendly roast to a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to roast')
                .setRequired(false)),

    new SlashCommandBuilder()
        .setName('compliment')
        .setDescription('Gives a compliment to a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to compliment')
                .setRequired(false)),
];

const handle = {
    dogfact: async (interaction) => {
        const facts = [
            'Dogs have a sense of time and miss you when you\'re gone!',
            'A dog\'s nose print is unique, much like a person\'s fingerprint.',
            'Dogs can learn more than 1000 words.',
            'Dogs can be taught to count and do simple math.',
            'A dog\'s mouth exerts 150-200 pounds of pressure per square inch.',
            'Dogs dream much like humans and can have nightmares too.',
            'Three dogs survived the sinking of the Titanic.',
            'Dogs have three eyelids.'
        ];

        const embed = new EmbedBuilder()
            .setColor('#8B4513')
            .setTitle('🐕 Dog Fact')
            .setDescription(facts[Math.floor(Math.random() * facts.length)])
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    catfact: async (interaction) => {
        const facts = [
            'Cats spend 70% of their lives sleeping.',
            'A group of cats is called a "clowder".',
            'Cats have over 20 muscles that control their ears.',
            'Cats can\'t taste sweetness.',
            'A cat\'s purr vibrates at a frequency that promotes bone healing.',
            'Cats have a third eyelid called a "nictitating membrane".',
            'A cat can jump up to six times its length.',
            'Cats have been associated with humans for nearly 10,000 years.'
        ];

        const embed = new EmbedBuilder()
            .setColor('#FF69B4')
            .setTitle('🐱 Cat Fact')
            .setDescription(facts[Math.floor(Math.random() * facts.length)])
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    approved: async (interaction) => {
        const user = interaction.options.getUser('user') || interaction.user;

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('✅ APPROVED')
            .setDescription(`${user.username}'s profile picture has been approved!`)
            .setImage(user.displayAvatarURL({ size: 512 }))
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    blur: async (interaction) => {
        const user = interaction.options.getUser('user') || interaction.user;

        const embed = new EmbedBuilder()
            .setColor('#808080')
            .setTitle('🌫️ BLURRED')
            .setDescription(`${user.username}'s avatar has been blurred! (Image effect would be applied with image processing)`)
            .setImage(user.displayAvatarURL({ size: 512 }))
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    contrast: async (interaction) => {
        const user = interaction.options.getUser('user') || interaction.user;

        const embed = new EmbedBuilder()
            .setColor('#FFFFFF')
            .setTitle('🔆 CONTRAST ADDED')
            .setDescription(`${user.username}'s avatar now has enhanced contrast! (Image effect would be applied with image processing)`)
            .setImage(user.displayAvatarURL({ size: 512 }))
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    deepfry: async (interaction) => {
        const user = interaction.options.getUser('user') || interaction.user;

        const embed = new EmbedBuilder()
            .setColor('#FF4500')
            .setTitle('🔥 DEEP FRIED')
            .setDescription(`${user.username}'s avatar has been deep fried! (Image effect would be applied with image processing)`)
            .setImage(user.displayAvatarURL({ size: 512 }))
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    weather: async (interaction) => {
        const location = interaction.options.getString('location');

        const embed = new EmbedBuilder()
            .setColor('#87CEEB')
            .setTitle(`🌤️ Weather in ${location}`)
            .setDescription('Weather API integration needed. Please add your weather API key to enable this feature.')
            .addFields(
                { name: 'Note', value: 'This command requires API integration with a weather service like OpenWeatherMap.' }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    define: async (interaction) => {
        const word = interaction.options.getString('word');

        const embed = new EmbedBuilder()
            .setColor('#4169E1')
            .setTitle(`📚 Definition: ${word}`)
            .setDescription('Dictionary API integration needed. Please add your dictionary API key to enable this feature.')
            .addFields(
                { name: 'Note', value: 'This command requires API integration with a dictionary service.' }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    nasanews: async (interaction) => {
        const term = interaction.options.getString('term');

        const embed = new EmbedBuilder()
            .setColor('#000080')
            .setTitle(`🚀 NASA Search: ${term}`)
            .setDescription('NASA API integration needed. This would search NASA\'s database for astronomy-related content.')
            .addFields(
                { name: 'Note', value: 'This command requires API integration with NASA\'s services.' }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    yomomma: async (interaction) => {
        const user = interaction.options.getUser('user') || interaction.user;

        const jokes = [
            'Yo mama so old, she knew Burger King when he was still a prince!',
            'Yo mama so short, you can see her feet on her driver\'s license!',
            'Yo mama so slow, it took her two hours to watch 60 Minutes!',
            'Yo mama so poor, ducks throw bread at her!',
            'Yo mama so ugly, when she tried to join an ugly contest, they said "Sorry, no professionals."'
        ];

        const embed = new EmbedBuilder()
            .setColor('#ff69b4')
            .setTitle('😂 Yo Mama Joke')
            .setDescription(`${user}, ${jokes[Math.floor(Math.random() * jokes.length)]}`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    joke: async (interaction) => {
        const jokes = [
            'Why don\'t scientists trust atoms? Because they make up everything!',
            'Why did the scarecrow win an award? He was outstanding in his field!',
            'Why don\'t eggs tell jokes? They\'d crack each other up!',
            'What do you call a fake noodle? An impasta!',
            'Why did the math book look so sad? Because it had too many problems!',
            'What do you call a sleeping bull? A bulldozer!',
            'Why don\'t programmers like nature? It has too many bugs!',
            'What\'s the best thing about Switzerland? I don\'t know, but the flag is a big plus!'
        ];

        const embed = new EmbedBuilder()
            .setColor('#ffff00')
            .setTitle('😄 Random Joke')
            .setDescription(jokes[Math.floor(Math.random() * jokes.length)])
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    '8ball': async (interaction) => {
        const question = interaction.options.getString('question');
        const responses = [
            'It is certain', 'Reply hazy, try again', 'Don\'t count on it', 'It is decidedly so',
            'My sources say no', 'Yes definitely', 'Very doubtful', 'Outlook good',
            'Most likely', 'Ask again later', 'Better not tell you now', 'My reply is no',
            'Outlook not so good', 'Signs point to yes', 'Cannot predict now', 'Concentrate and ask again',
            'As I see it, yes', 'Without a doubt', 'Yes', 'No'
        ];

        const embed = new EmbedBuilder()
            .setColor('#800080')
            .setTitle('🎱 Magic 8-Ball')
            .addFields(
                { name: 'Question', value: question },
                { name: 'Answer', value: responses[Math.floor(Math.random() * responses.length)] }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    coinflip: async (interaction) => {
        const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
        const emoji = result === 'Heads' ? '🪙' : '🥉';

        const embed = new EmbedBuilder()
            .setColor('#ffd700')
            .setTitle(`${emoji} Coin Flip`)
            .setDescription(`The coin landed on **${result}**!`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    dice: async (interaction) => {
        const sides = interaction.options.getInteger('sides') || 6;
        const result = Math.floor(Math.random() * sides) + 1;

        const embed = new EmbedBuilder()
            .setColor('#ff4500')
            .setTitle('🎲 Dice Roll')
            .setDescription(`You rolled a **${result}** on a ${sides}-sided dice!`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    meme: async (interaction) => {
        const memes = [
            'https://i.imgflip.com/1bij.jpg',
            'https://i.imgflip.com/2/30b1gx.jpg',
            'https://i.imgflip.com/26am.jpg',
            'https://i.imgflip.com/23ls.jpg',
            'https://i.imgflip.com/25w3.jpg'
        ];

        const memeTexts = [
            'When you finally understand a programming concept',
            'Me explaining my code to other developers',
            'When the code works on the first try',
            'Debugging be like...',
            'When you forget a semicolon'
        ];

        const randomIndex = Math.floor(Math.random() * memes.length);

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('😂 Random Meme')
            .setDescription(memeTexts[randomIndex])
            .setImage(memes[randomIndex])
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    quote: async (interaction) => {
        const quotes = [
            '"The only way to do great work is to love what you do." - Steve Jobs',
            '"Innovation distinguishes between a leader and a follower." - Steve Jobs',
            '"Life is what happens to you while you\'re busy making other plans." - John Lennon',
            '"The future belongs to those who believe in the beauty of their dreams." - Eleanor Roosevelt',
            '"It is during our darkest moments that we must focus to see the light." - Aristotle',
            '"Success is not final, failure is not fatal: it is the courage to continue that counts." - Winston Churchill',
            '"The only impossible journey is the one you never begin." - Tony Robbins',
            '"In the end, we will remember not the words of our enemies, but the silence of our friends." - Martin Luther King Jr.'
        ];

        const embed = new EmbedBuilder()
            .setColor('#4169e1')
            .setTitle('💭 Inspirational Quote')
            .setDescription(quotes[Math.floor(Math.random() * quotes.length)])
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    riddle: async (interaction) => {
        const riddles = [
            { riddle: 'What has keys but no locks, space but no room, you can enter but not go inside?', answer: 'A keyboard' },
            { riddle: 'I am not alive, but I grow; I don\'t have lungs, but I need air; I don\'t have a mouth, but water kills me. What am I?', answer: 'Fire' },
            { riddle: 'What can travel around the world while staying in a corner?', answer: 'A stamp' },
            { riddle: 'What has hands but cannot clap?', answer: 'A clock' },
            { riddle: 'What gets wetter the more it dries?', answer: 'A towel' }
        ];

        const randomRiddle = riddles[Math.floor(Math.random() * riddles.length)];

        const embed = new EmbedBuilder()
            .setColor('#9932cc')
            .setTitle('🧩 Riddle Time!')
            .setDescription(randomRiddle.riddle)
            .setFooter({ text: `Think you know? The answer is: ${randomRiddle.answer}` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    trivia: async (interaction) => {
        const trivia = [
            { question: 'What is the largest planet in our solar system?', answer: 'Jupiter' },
            { question: 'Which programming language was developed by Guido van Rossum?', answer: 'Python' },
            { question: 'What does "WWW" stand for?', answer: 'World Wide Web' },
            { question: 'In which year was Discord founded?', answer: '2015' },
            { question: 'What is the smallest country in the world?', answer: 'Vatican City' }
        ];

        const randomTrivia = trivia[Math.floor(Math.random() * trivia.length)];

        const embed = new EmbedBuilder()
            .setColor('#ff6347')
            .setTitle('🧠 Trivia Question')
            .setDescription(randomTrivia.question)
            .setFooter({ text: `Answer: ${randomTrivia.answer}` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    roast: async (interaction) => {
        const user = interaction.options.getUser('user') || interaction.user;
        const roasts = [
            'You\'re not stupid; you just have bad luck thinking.',
            'I\'d agree with you, but then we\'d both be wrong.',
            'You bring everyone so much joy... when you leave the room.',
            'I\'m not saying you\'re ugly, but when you were born, the doctor slapped your parents.',
            'You\'re like a software update. Whenever I see you, I think "not now."'
        ];

        const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('🔥 Friendly Roast')
            .setDescription(`${user}, ${roasts[Math.floor(Math.random() * roasts.length)]}`)
            .setFooter({ text: 'Just kidding! You\'re awesome! 😄' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    compliment: async (interaction) => {
        const user = interaction.options.getUser('user') || interaction.user;
        const compliments = [
            'You have an amazing sense of humor!',
            'You\'re incredibly thoughtful and kind.',
            'Your creativity knows no bounds!',
            'You have a wonderful way of making others feel valued.',
            'You\'re a great problem solver!',
            'Your positive energy is contagious!',
            'You have excellent taste in Discord bots! 😉',
            'You\'re doing an amazing job at being yourself!'
        ];

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('💝 Compliment')
            .setDescription(`${user}, ${compliments[Math.floor(Math.random() * compliments.length)]}`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};

module.exports = { commands, handle };
