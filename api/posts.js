const { Client } = require("@notionhq/client");

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.NOTION_DATABASE_ID;

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
const response = await notion.databases.query({
  database_id: databaseId,
  // Enlève le filtre pour tester
});

    const posts = response.results.map(page => ({
      id: page.id,
      title: page.properties.title?.title[0]?.plain_text || "",
      slug: page.properties.slug?.rich_text[0]?.plain_text || "",
      date: page.properties.date?.date?.start || "",
      excerpt: page.properties.excerpt?.rich_text[0]?.plain_text || "",
      category: page.properties.category?.select?.name || "",
      cover: page.properties.cover?.files[0]?.file?.url || "",
    }));

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
