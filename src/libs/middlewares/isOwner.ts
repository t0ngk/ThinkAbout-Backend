import { Response, NextFunction } from "express";
import prisma from "../prisma";
import { UserRequest } from "../types/UserRequest";

const isOwner = async (req: UserRequest, res: Response, next: NextFunction) => {
  const user = req.user;
  const questionId = req.params.id;
  const question = await prisma.question.findUnique({
    where: { id: parseInt(questionId) },
  });
  if (!question) {
    return res.status(404).json({ message: "Question not found" });
  }
  if (question.userId !== user.id) {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};

export default isOwner;
