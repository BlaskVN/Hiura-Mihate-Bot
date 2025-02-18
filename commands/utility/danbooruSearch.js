const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const axios = require("axios");
const cheerio = require("cheerio");
const danbooruURL = 'https://danbooru.donmai.us';

var tag;

class Illustration {
  constructor(name, artistURL, image) {
    this.name = name;
    this.artistURL = artistURL;
    this.image = image;
  }
}

function getRandomPage() {
  return Math.floor(Math.random() * 10) + 1;
}

async function fetchImageLink(tag) {
  try {
    const page = getRandomPage();
    const response = await axios.get(`${danbooruURL}/posts?page=${page}&tags=${tag}`);
    const $ = cheerio.load(response.data);
    const posts = $('a.post-preview-link');
    if (!posts.length) return null;
    const randomPost = posts[Math.floor(Math.random() * posts.length)];
    return $(randomPost).attr('href');
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function fetchImage() {
  const currentLink = await fetchImageLink(tag);
  if (!currentLink) return null;
  try {
    const response = await axios.get(`${danbooruURL}${currentLink}`);
    const $ = cheerio.load(response.data);
    const name = $('ul.artist-tag-list li.tag-type-1').attr('data-tag-name');
    const artistURL = $('ul.artist-tag-list li span a.search-tag').attr('href');
    const image = $('.fit-width').attr("src");
    return new Illustration(name, artistURL, image);
  } catch (error) {
    console.error(error);
    return null;
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('danbooru')
    .setDescription('Tìm kiếm hình ảnh theo tag.')
    .addStringOption(option =>
      option.setName('tag')
        .setDescription('Tag để tìm kiếm.')
        .setRequired(true)),
  async execute(interaction) {

    if (!interaction.channel.nsfw) {
      return interaction.reply({ content: 'Chỉ có thể sử dụng lệnh này trong kênh NSFW.', ephemeral: true });
    }

    tag = interaction.options.getString('tag');
    const illustration = await fetchImage();
    if (!illustration) {
      return interaction.reply('No image found.');
    }
    const imageEmbed = new EmbedBuilder()
      .setTitle(illustration.name)
      .setURL(`https://danbooru.donmai.us${illustration.artistURL}`)
      .setImage(illustration.image)
      .setColor(0x0099ff);

    await interaction.reply({ embeds: [imageEmbed] });
  },
};