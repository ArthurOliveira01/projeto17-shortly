import { Router } from "express";
import { postURL, getByIdUrl, openShort, deleteUrl } from "../controllers/url.controllers.js";

const urlRoutes = Router();

urlRoutes.post("/urls/shorten", postURL);
urlRoutes.get("/urls/:id", getByIdUrl);
urlRoutes.get("/urls/open/:shortUrl", openShort);
urlRoutes.delete("/urls/:id", deleteUrl);


export default urlRoutes