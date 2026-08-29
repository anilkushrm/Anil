import { Router, type IRouter } from "express";
import authRouter from "./auth";
import crmRouter from "./crm";
import healthRouter from "./health";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(crmRouter);

export default router;
