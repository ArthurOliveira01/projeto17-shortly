import { Router } from "express";
import accountRouter from "./account.routes.js";
import urlRoutes from "./url.routes.js";

const router = Router();

router.use(accountRouter);
router.use(urlRoutes);

export default router;