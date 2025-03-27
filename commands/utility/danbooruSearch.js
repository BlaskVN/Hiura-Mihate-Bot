const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require("axios");
const cheerio = require("cheerio");
const danbooruURL = 'https://danbooru.donmai.us';
const tagManager = require('../../controllers/danbooru/tagManager');

var tag;

class Illustration {
  constructor(id, name, artistURL, image, tags, rating, characters) {
    this.id = id;
    this.name = name;
    this.artistURL = artistURL;
    this.image = image;
    this.tags = tags;
    this.rating = rating;
    this.characters = characters;
  }
}

function formatTag(tag) {
  return tag.toLowerCase().replace(/\s+/g, '_');
}

function getRandomPage() {
  return Math.floor(Math.random() * 10) + 1;
}

async function fetchImageLink(tag) {
  try {
    const formattedTag = formatTag(tag);
    const url = `${danbooruURL}/posts.json?tags=${encodeURIComponent(formattedTag)}+order:random&limit=1`;
    const response = await axios.get(url);
    
    if (!response.data || response.data.length === 0) {
      return null;
    }
    
    return response.data[0];
  } catch (error) {
    return null;
  }
}

async function fetchImage() {
  try {
    const post = await fetchImageLink(tag);
    if (!post) return null;

    const name = post.tag_string_artist || 'Unknown Artist';
    const artistURL = `/posts/${post.id}`;
    const image = post.file_url;
    const rating = post.rating;
    const allTags = post.tag_string.split(' ').filter(tag => tag.length > 0);
    const characters = post.tag_string_character ? post.tag_string_character.split(' ').filter(char => char.length > 0) : [];

    return new Illustration(post.id, name, artistURL, image, allTags, rating, characters);

  } catch (error) {
    console.error('Lỗi khi tải ảnh:', error);
    return null;
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('danbooru')
    .setDescription('Tìm kiếm hình ảnh theo tag từ Danbooru.')
    .addStringOption(option =>
      option.setName('tag')
        .setDescription('Tag để tìm ảnh')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('searchtag')
        .setDescription('Tìm tag')
        .setRequired(false)),

  async execute(interaction) {
    try {
      await interaction.deferReply();

      if (!interaction.channel.nsfw) {
        return interaction.editReply({ 
          content: '❌ Chỉ có thể sử dụng lệnh này trong kênh NSFW.', 
          ephemeral: true 
        });
      }

      const tagOption = interaction.options.getString('tag');
      const searchTagOption = interaction.options.getString('searchtag');

      if (tagOption && searchTagOption) {
        return interaction.editReply({
          content: '❌ Chỉ có thể sử dụng một trong hai option: tag hoặc searchtag.',
          ephemeral: true
        });
      }

      if (!tagOption && !searchTagOption) {
        return interaction.editReply({
          content: '❌ Vui lòng sử dụng một trong hai option: tag hoặc searchtag.',
          ephemeral: true
        });
      }

      if (searchTagOption) {
        const suggestions = await tagManager.getSuggestions(searchTagOption);
        if (suggestions.length === 0) {
          return interaction.editReply('❌ Không tìm thấy gợi ý tag nào phù hợp.');
        }

        const suggestionEmbed = new EmbedBuilder()
          .setTitle('Search Tag')
          .setDescription('Here are the tag suggestions:')
          .setColor(0xFF69B4)
          .setTimestamp();

        suggestions.forEach(suggestion => {
          suggestionEmbed.addFields({
            name: `${suggestion.name} (${suggestion.post_count})`,
            value: `Type: ${suggestion.category}`
          });
        });

        return interaction.editReply({ embeds: [suggestionEmbed] });
      }

      tag = tagOption;
      const illustration = await fetchImage();

      if (!illustration) {
        return interaction.editReply('❌ Không tìm thấy ảnh nào phù hợp với tag này.');
      }

      const imageEmbed = new EmbedBuilder()
        .setTitle('Danbooru Image')
        .setURL(`${danbooruURL}${illustration.artistURL}`)
        .setImage(illustration.image)
        .setColor(0xFFD700)
        .setTimestamp();

      // Thông tin tác giả
      imageEmbed.addFields({ 
        name: 'Artist', 
        value: illustration.name.replace(/[_*~`]/g, "\\$&")
      });

      // Thông tin nhân vật 
      if (illustration.characters && illustration.characters.length > 0) {
        imageEmbed.addFields({
          name: 'Characters',
          value: illustration.characters.map(char => char.replace(/[_*~`]/g, "\\$&")).join(', ')
        });
      }

      // All Tags
      if (illustration.tags.length > 0) {
        imageEmbed.addFields({
          name: 'Tags',
          value: illustration.tags.map(tag => tag.replace(/[_*~`]/g, "\\$&")).join(' ')
        });
      }

      await interaction.editReply({ embeds: [imageEmbed] });

    } catch (error) {
      console.error('Lỗi trong lệnh danbooru:', error);
      await interaction.editReply({
        content: '❌ Có lỗi xảy ra khi tìm kiếm ảnh. Vui lòng thử lại sau.',
        ephemeral: true
      });
    }
  },
};