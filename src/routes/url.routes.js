import { Router } from "express";
import { postURL, getByIdUrl } from "../controllers/url.controllers.js";

const urlRoutes = Router();

urlRoutes.post("/urls/shorten", postURL);
urlRoutes.get("/urls/:id", getByIdUrl);


export default urlRoutes