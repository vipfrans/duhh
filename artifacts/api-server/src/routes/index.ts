import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usernamesRouter from "./usernames";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/usernames", usernamesRouter);

export default router;
