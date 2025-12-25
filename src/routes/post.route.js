import { Router } from "express";
import { isLoggedIn } from "../middleware/auth.middleware.js";
import {
  listPosts,
  viewPost,
  showPostForm,
  savePost,
  deletePost,
} from "../controllers/post.controllers.js";

const postRoute = Router();

postRoute.get("/", listPosts);
postRoute.get("/admin/new", isLoggedIn, showPostForm);
postRoute.get("/admin/:id/edit", isLoggedIn, showPostForm);
postRoute.post("/admin/save", isLoggedIn, savePost);
postRoute.get("/admin/:id", isLoggedIn, deletePost);
postRoute.get("/:slug", viewPost);

export default postRoute;
