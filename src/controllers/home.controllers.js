import { pool } from '../config/db.js';
import { promoColors, badgeClasses } from '../utils/admin.utils.js';
import { sanitizeMarkdown } from '../utils/helpers.utils.js';

export async function renderLanding(req, res) {
  try {
    // 1. Fetch promo cards
    const [promoCards] = await pool.query(
      'SELECT * FROM promo_cards ORDER BY id ASC',
    );

    // 2. Sanitize promo card text content
    const sanitizedPromoCards = promoCards.map((card) => ({
      ...card,
      title: sanitizeMarkdown(card.title),
      subtitle: sanitizeMarkdown(card.subtitle),
      small_text: sanitizeMarkdown(card.small_text),
    }));

    // 3. Fetch Popular Products from main products table
    const [popularProducts] = await pool.query(
      'SELECT * FROM products WHERE is_popular = 1 ORDER BY id DESC LIMIT 12',
    );

    // 4. Fetch Popular Categories for homepage
    const [popularCategories] = await pool.query(
      'SELECT * FROM categories WHERE is_popular = 1 ORDER BY name LIMIT 12',
    );

    popularProducts.forEach((product) => {
      product.badgeClass =
        product.badge && badgeClasses[product.badge]
          ? badgeClasses[product.badge]
          : '';
    });

    res.render('index', {
      title: 'morishCart - Shopping made easy and efficient',
      promoCards: sanitizedPromoCards,
      promoColors,
      popularProducts,
      popularCategories,
      badgeClasses,
      admin: req.session.admin || null, // To show/hide admin controls
    });
  } catch (error) {
    console.error('LANDING ERROR:', error);

    // fallback values
    const badgeClasses = {
      sale: 'bg-danger',
      hot: 'bg-warning',
      promo: 'bg-success',
      new: 'bg-primary',
      none: 'd-none',
    };

    res.render('index', {
      title: 'morishCart - Shopping made easy and efficient',
      promoCards: [],
      promoColors: {},
      popularProducts: [],
      popularCategories: [],
      badgeClasses,
      admin: req.session.admin || null,
    });
  }
}
