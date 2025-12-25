import { pool } from "./db.js";

export async function getAllPosts(status = "published") {
  const [rows] = await pool.query(
    `
    SELECT id, title, slug, excerpt, featured_image, type,
           event_date, event_location, created_at
    FROM posts
    WHERE status = ?
    ORDER BY created_at DESC
    `,
    [status],
  );
  return rows;
}

export async function getPostBySlug(slug) {
  const [[post]] = await pool.query(
    `SELECT * FROM posts WHERE slug = ? AND status = 'published'`,
    [slug],
  );

  if (post) {
    await pool.query(
      `UPDATE posts SET view_count = view_count + 1 WHERE id = ?`,
      [post.id],
    );
  }

  return post;
}

export async function getPostBySlugForPreview(slug) {
  const [[post]] = await pool.query(
    `SELECT * FROM posts WHERE slug = ?`,
    [slug]
  );
  return post;
}

export async function getPostsForAdmin() {
  const [rows] = await pool.query(
    `SELECT * FROM posts ORDER BY created_at DESC`,
  );
  return rows;
}

export async function getPostById(id) {
  const [[post]] = await pool.query(`SELECT * FROM posts WHERE id = ?`, [id]);
  return post;
}

export async function createPost(data) {
  const {
    title,
    slug,
    excerpt,
    content,
    meta_description,
    featured_image,
    og_image,
    type,
    event_date,
    event_end_date,
    event_location,
    whatsapp_template,
    status,
    author_id,
  } = data;

  await pool.query(
    `
    INSERT INTO posts
    (title, slug, excerpt, content, meta_description,
     featured_image, og_image, type,
     event_date, event_end_date, event_location,
     whatsapp_template, status, author_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      title,
      slug,
      excerpt,
      content,
      meta_description,
      featured_image,
      og_image,
      type,
      event_date,
      event_end_date,
      event_location,
      whatsapp_template,
      status,
      author_id,
    ],
  );
}

export async function updatePost(id, data) {
  await pool.query(
    `
    UPDATE posts SET
      title=?, slug=?, excerpt=?, content=?,
      meta_description=?, featured_image=?, og_image=?,
      type=?, event_date=?, event_end_date=?, event_location=?,
      whatsapp_template=?, status=?
    WHERE id=?
    `,
    [
      data.title,
      data.slug,
      data.excerpt,
      data.content,
      data.meta_description,
      data.featured_image,
      data.og_image,
      data.type,
      data.event_date,
      data.event_end_date,
      data.event_location,
      data.whatsapp_template,
      data.status,
      id,
    ],
  );
}

export async function RemovePost(id) {
  await pool.query(`DELETE FROM posts WHERE id = ?`, [id]);
}
