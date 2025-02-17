require("dotenv").config();

const axios = require("axios");
const cheerio = require("cheerio");
const danbooruURL = process.env.DANBOORU_URL;


var link;
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
    await axios
      .get(`${danbooruURL}/posts?page=${page}&tags=${tag}`)
      .then((response) => {
        const data = response.data;
        const $ = cheerio.load(data);
        const posts = $('a.post-preview-link');
        const randomPost = posts[Math.floor(Math.random() * posts.length)]; 
        link = $(randomPost).attr('href');
      });
  } catch (error) {
    console.error(error);
  }
}

async function fetchImage() {
  await fetchImageLink(tag);
  try {
    await axios
      .get(`${danbooruURL}${link}`)
      .then((response) => {
        const data = response.data;
        const $ = cheerio.load(data);
        const name = $('ul.artist-tag-list li.tag-type-1').attr('data-tag-name');
        const artistURL = $('ul.artist-tag-list li span a.search-tag').attr('href');
        const image = $('.fit-width').attr("src");
        let illustration = new Illustration(name, artistURL, image);
        console.log(illustration);
        return illustration;
      });
  } catch (error) {
    console.error(error);
  }
}

module.exports = fetchImage;

