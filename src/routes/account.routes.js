import { Router } from "express";
import { signup, signin } from "../controllers/account.controllers.js";

const accountRouter = Router();

accountRouter.post("/signup", signup);
accountRouter.post("/signin", signin);


export default accountRouter;