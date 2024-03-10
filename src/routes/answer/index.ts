import { Router, Response, Request } from "express";
import { UserRequest } from "../../libs/types/UserRequest";
import isUserLogin from "../../libs/middlewares/isUserLogin";
import prisma from "../../libs/prisma";
import { z } from "zod";

const router = Router();

const answerCreateSchema = z.object({
  answer: z.string(),
});

router.post(
  "/create/:id",
  isUserLogin,
  async (req: UserRequest, res: Response) => {
    try {
      const data = answerCreateSchema.parse(req.body);
      const questionId = req.params.id;
      const question = await prisma.question.findUnique({
        where: { id: parseInt(questionId) },
      });
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }
      if (question.userId === req.user.id) {
        return res
          .status(403)
          .json({ message: "You can't answer your question" });
      }
      await prisma.answer.create({
        data: {
          answer: data.answer,
          questionId: question.id,
          userId: req.user.id,
        },
      });
      const totalAnswer = await prisma.answer.count({
        where: { questionId: question.id },
      });
      const sameAnswer = await prisma.answer.count({
        where: { questionId: question.id, answer: data.answer },
      });
      const percentage = (sameAnswer / totalAnswer) * 100;
      return res.status(200).json(percentage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid data", errors: error.errors });
      }
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

export default router;
