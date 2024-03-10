import { Router, Response, Request } from "express";
import { UserRequest } from "../../libs/types/UserRequest";
import isUserLogin from "../../libs/middlewares/isUserLogin";
import prisma from "../../libs/prisma";

const router = Router();

router.post("/buy/premium", isUserLogin, async (req: UserRequest, res: Response) => {
  try {
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        package: "premium",
      },
    });
    return res.status(200).json({
      message: "Premium package bought successfully!",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/buy/free", isUserLogin, async (req: UserRequest, res: Response) => {
  try {
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        package: "free",
      },
    });
    return res.status(200).json({
      message: "Free package bought successfully!",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
