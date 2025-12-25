import {
  getAllPosts,
  getPostBySlug,
  getPostBySlugForPreview,
  getPostsForAdmin,
  getPostById,
  createPost,
  updatePost,
  RemovePost,
} from "../config/post.js";

export async function listPosts(req, res) {
  try {
    const isAdmin = !!req.session.admin;
    const posts = isAdmin ? await getPostsForAdmin() : await getAllPosts();

    res.render("post", {
      title: isAdmin ? "Manage Posts" : "Blog & Updates",
      posts,
      admin: req.session.admin || null,
      isAdminView: isAdmin,
    });
  } catch (err) {
    console.error("LIST POSTS ERROR:", err);
    req.flash("error", "Failed to load posts.");
    return res.redirect("/");
  }
}

export async function viewPost(req, res) {
  try {
    const isAdmin = !!req.session.admin;

    // Admin can see all posts, public only sees published
    const post = isAdmin
      ? await getPostBySlugForPreview(req.params.slug)
      : await getPostBySlug(req.params.slug);

    if (!post) {
      req.flash("error", "Post not found or not published yet.");
      return res.redirect("/api/posts");
    }

    // Show draft warning for admins
    const isDraft = post.status === "draft";
    const fullUrl = `${req.protocol}://${req.get("host")}/api/posts/${post.slug}`;

    res.render("postSingle", {
      title: post.title,
      post,
      admin: req.session.admin || null,
      isDraft,
      fullUrl,
      req,
    });
  } catch (err) {
    console.error("VIEW POST ERROR:", err);
    req.flash("error", "Something went wrong.");
    return res.redirect("/api/posts");
  }
}

export async function showPostForm(req, res) {
  try {
    const post = req.params.id ? await getPostById(req.params.id) : null;

    if (req.params.id && !post) {
      req.flash("error", "Post not found.");
      return res.redirect("/api/posts");
    }

    res.render("postForm", {
      title: post ? "Edit Post" : "New Post",
      post,
      admin: req.session.admin,
    });
  } catch (err) {
    console.error("SHOW POST FORM ERROR:", err);
    req.flash("error", "Something went wrong.");
    return res.redirect("/api/posts");
  }
}

export async function savePost(req, res) {
  try {
    const data = {
      ...req.body,
      author_id: req.session.admin.id,
      event_date: req.body.event_date || null,
      event_end_date: req.body.event_end_date || null,
    };

    if (req.body.id) {
      await updatePost(req.body.id, data);
      req.flash("success", "Post updated successfully.");
    } else {
      // Check if slug already exists
      const existing = await getPostBySlug(data.slug);
      if (existing) {
        req.flash("error", "A post with this title already exists. Please use a different title.");
        return res.redirect("/api/posts/admin/new");
      }
      
      await createPost(data);
      req.flash("success", "Post created successfully.");
    }

    res.redirect("/api/posts");
  } catch (err) {
    console.error("SAVE POST ERROR:", err);
    req.flash("error", "Failed to save post.");
    return res.redirect("/api/posts");
  }
}

export async function deletePost(req, res) {
  try {
    await RemovePost(req.params.id);
    req.flash("success", "Post deleted successfully.");
    res.redirect("/api/posts");
  } catch (err) {
    console.error("DELETE POST ERROR:", err);
    req.flash("error", "Failed to delete post.");
    return res.redirect("back");
  }
}
