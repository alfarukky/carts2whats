import { pool } from "../config/db.js";
import { promoColors, badgeClasses } from "../utils/admin.utils.js";
export async function renderLanding(req, res) {
  try {
    // 1. Fetch promo cards
    const [promoCards] = await pool.query(
      "SELECT * FROM promo_cards ORDER BY id ASC",
    );

    // 2. Fetch Popular Products from main products table
    const [popularProducts] = await pool.query(
      "SELECT * FROM products WHERE is_popular = 1 ORDER BY id DESC LIMIT 12",
    );

    res.render("index", {
      title: "morishCart - Shopping made easy and efficient",
      promoCards,
      promoColors,
      popularProducts,
      badgeClasses,
      admin: req.session.admin || null, // To show/hide admin controls
    });
  } catch (error) {
    console.error("LANDING ERROR:", error);

    // fallback values
    const badgeClasses = {
      sale: "bg-danger",
      hot: "bg-warning",
      promo: "bg-success",
      new: "bg-primary",
      none: "d-none",
    };

    res.render("index", {
      title: "morishCart - Shopping made easy and efficient",
      promoCards: [],
      promoColors: {},
      popularProducts: [],
      badgeClasses,
      admin: req.session.admin || null,
    });
  }
}
