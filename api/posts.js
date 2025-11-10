const { Client } = require("@notionhq/client");

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.NOTION_DATABASE_ID;

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: "published",
        checkbox: {
          equals: true
        }
      }
    });

    const posts = response.results.map(page => {
      const props = page.properties;
      
      return {
        id: page.id,
        title: props.title?.title?.[0]?.plain_text || "",
        slug: props.slug?.rich_text?.[0]?.plain_text || "",
        date: props.date?.date?.start || "",
        excerpt: props.excerpt?.rich_text?.[0]?.plain_text || "",
        category: props.category?.select?.name || "",
        cover: props.cover?.files?.[0]?.file?.url || props.cover?.files?.[0]?.external?.url || ""
      };
    });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
