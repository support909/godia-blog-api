const { Client } = require("@notionhq/client");

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.NOTION_DATABASE_ID;

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
    });

    // DEBUG: Affiche les noms de propriétés
    if (response.results.length > 0) {
      const propertyNames = Object.keys(response.results[0].properties);
      return res.status(200).json({ 
        debug: "Property names found",
        properties: propertyNames,
        firstPage: response.results[0].properties
      });
    }

    res.status(200).json({ error: "No pages found" });
  } catch (error) {
    res.status(500).json({ error: error.message, stack: error.stack });
  }
};
