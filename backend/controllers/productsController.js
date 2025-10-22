import db from "../db.js";

export const getAllProducts = async (req, res) => {
  try {
    const result = await db.all("SELECT * FROM products");
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};
