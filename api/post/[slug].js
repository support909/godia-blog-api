const { Client } = require("@notionhq/client");

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.NOTION_DATABASE_ID;

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { slug } = req.query;

  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        and: [
          { property: "slug", rich_text: { equals: slug } },
          { property: "published", checkbox: { equals: true } }
        ]
      }
    });

    if (response.results.length === 0) {
      return res.status(404).json({ error: "Post not found" });
    }

    const page = response.results[0];
    const blocks = await notion.blocks.children.list({ block_id: page.id });

    const content = blocks.results.map(block => {
      if (block.type === "paragraph") {
        return { type: "text", text: block.paragraph.rich_text.map(t => t.plain_text).join("") };
      }
      if (block.type === "heading_1") {
        return { type: "heading_1", text: block.heading_1.rich_text.map(t => t.plain_text).join("") };
      }
      if (block.type === "heading_2") {
        return { type: "heading_2", text: block.heading_2.rich_text.map(t => t.plain_text).join("") };
      }
      if (block.type === "heading_3") {
        return { type: "heading_3", text: block.heading_3.rich_text.map(t => t.plain_text).join("") };
      }
      if (block.type === "bulleted_list_item") {
        return { type: "bulleted_list_item", text: block.bulleted_list_item.rich_text.map(t => t.plain_text).join("") };
      }
      return null;
    }).filter(Boolean);

    const post = {
      id: page.id,
      title: page.properties.title?.title[0]?.plain_text || "",
      slug: page.properties.slug?.rich_text[0]?.plain_text || "",
      date: page.properties.date?.date?.start || "",
      excerpt: page.properties.excerpt?.rich_text[0]?.plain_text || "",
      category: page.properties.category?.select?.name || "",
      cover: page.properties.cover?.files[0]?.file?.url || "",
      content: content
    };

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
