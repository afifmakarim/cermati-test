const config = require("./config");
const axios = require("axios");
const cheerio = require("cheerio");
const { Promise } = require("bluebird");
const fs = require("fs");

const scrapeData = async (url) => {
  try {
    const html = await axios.get(url);
    const $ = cheerio.load(html.data);
    return $;
  } catch (error) {
    console.error(error);
  }
};

const getArticles = async () => {
  try {
    let data = [];
    const full = {
      articles: data,
    };
    // scrape url on /artikel
    $ = await scrapeData(config.BASE_URL);
    await Promise.all(
      $(".article-list-item > a").map(async function () {
        const url =
          config.BASE_URL.replace("/artikel", "") + $(this).attr("href");

        // scrape post
        post = await scrapeData(url);
        const title = post(".post-title").text().trim();
        const author = post(".author-name").text().trim();
        const postingDate = post(".post-date > span").text().trim();
        let relatedArticle = [];
        post(".panel-items-list")
          .first()
          .children("li")
          .each(function () {
            relatedTitle = post(this).find("h5").text();
            relatedUrl = post(this).find("a").attr("href");
            relatedArticle.push({
              relatedTitle,
              relatedUrl,
            });
          });

        data.push({
          title,
          author,
          postingDate,
          relatedArticle,
        });
      })
    );
    return full;
  } catch (err) {
    console.error(err);
  }
};

getArticles().then((resolvedValue) => {
  const writableStream = fs.createWriteStream("solution.json");
  writableStream.write(JSON.stringify(resolvedValue));
  writableStream.end();
});
