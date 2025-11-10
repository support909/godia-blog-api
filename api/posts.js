const { Client } = require("@notionhq/client");

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.NOTION_DATABASE_ID;

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
    });

    const posts = response.results.map(page => {
      const props = page.properties;
      
      // Fonction helper pour extraire le texte
      const getText = (prop) => {
        if (prop?.title) return prop.title[0]?.plain_text || "";
        if (prop?.rich_text) return prop.rich_text[0]?.plain_text || "";
        return "";
      };
      
      return {
        id: page.id,
        title: getText(props.title),
        slug: getText(props.slug),
        date: props.date?.date?.start || "",
        excerpt: getText(props.excerpt),
        category: props.category?.select?.name || "",
        cover: props.cover?.files?.[0]?.file?.url || props.cover?.files?.[0]?.external?.url || "",
        published: props.published?.checkbox || false
      };
    });

    // NE FILTRE PAS pour voir les données
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message, stack: error.stack });
  }
};
