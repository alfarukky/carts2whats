import { pool } from "../config/db.js";

export async function showPromoEditForm(req, res) {
  try {
    const [card] = await pool.query("SELECT * FROM promo_cards WHERE id = ?", [
      req.params.id,
    ]);

    if (card.length === 0) {
      req.flash("error", "Promo card not found.");
      return res.redirect("back");
    }

    return res.render("promoEdit", {
      title: "Edit Promo Card",
      card: card[0],
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong.");
    return res.redirect("back");
  }
}

export async function updatePromoCard(req, res) {
  try {
    const { title, subtitle, small_text, button_link } = req.body;
    const { id } = req.params;

    let imageQuery = "";
    let params = [title, subtitle, small_text, button_link || "/api/products"];

    if (req.file) {
      const imageName = req.file.optimizedName || req.file.filename;
      imageQuery = ", image = ?";
      params.push(imageName);
    }

    params.push(id);

    await pool.query(
      `UPDATE promo_cards
       SET title = ?, subtitle = ?, small_text = ?, button_link = ? ${imageQuery}
       WHERE id = ?`,
      params,
    );

    req.flash("success", "Promo card updated successfully.");
    return res.redirect(`/api/admin/promo/${id}/edit`);
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to update promo card.");
    return res.redirect("back");
  }
}
