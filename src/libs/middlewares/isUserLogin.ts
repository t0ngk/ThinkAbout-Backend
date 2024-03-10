import { Response, NextFunction } from "express";
import prisma from "../prisma";
import jwt from "jsonwebtoken";
import { UserRequest } from "../types/UserRequest";

const isUserLogin = async (
  req: UserRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    const user = await prisma.user.findUnique({
      where: { id: (payload as any).userId },
      select: {
        id: true,
        name: true,
        email: true,
        DateOfBirth: true,
        Gender: true,
        package: true,
      },
    });
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export default isUserLogin;
