import { Router } from "express";
import { signup, signin, getinfoUser, getRanking } from "../controllers/account.controllers.js";

const accountRouter = Router();

accountRouter.post("/signup", signup);
accountRouter.post("/signin", signin);
accountRouter.get("/users/me", getinfoUser);
accountRouter.get("/ranking", getRanking);

export default accountRouter;