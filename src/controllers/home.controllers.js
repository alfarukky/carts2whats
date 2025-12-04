import { pool } from "../config/db.js";

export async function renderLanding(req, res) {
  try {
    // Fetch promo cards from DB
    const [promoCards] = await pool.query("SELECT * FROM promo_cards ORDER BY id ASC");

    // Predefined background colors (NOT saved in DB)
    const promoColors = {
      1: "bg-info",
      2: "bg-primary",
      3: "bg-secondary",
    };

    res.render("index", {
      title: "morishCart - Shopping made easy and efficient",
      promoCards,
      promoColors,
      admin: req.session.admin || null, // Admin only when logged in
    });

  } catch (error) {
    console.error("LANDING ERROR:", error);
    res.render("index", {
      title: "morishCart - Shopping made easy and efficient",
      promoCards: [],
      promoColors: {},
      admin: null,
    });
  }
}
