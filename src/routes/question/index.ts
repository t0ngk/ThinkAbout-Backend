import { Router, Response, Request } from "express";
import { UserRequest } from "../../libs/types/UserRequest";
import isUserLogin from "../../libs/middlewares/isUserLogin";
import prisma from "../../libs/prisma";
import { z } from "zod";
import isOwner from "../../libs/middlewares/isOwner";

const router = Router();

const questionCreateSchema = z.object({
  question: z.string(),
  choices: z.array(z.string()),
});

router.post("/create", isUserLogin, async (req: UserRequest, res: Response) => {
  try {
    const data = questionCreateSchema.parse(req.body);
    const question = await prisma.question.create({
      data: {
        question: data.question,
        choices: data.choices,
        userId: req.user.id,
      },
    });
    return res.status(200).json(question);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: "Invalid data", errors: error.errors });
    }
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get(
  "/isOwner/:id",
  isUserLogin,
  isOwner,
  async (req: UserRequest, res: Response) => {
    try {
      const questionId = req.params.id;
      const question = await prisma.question.findUnique({
        where: { id: parseInt(questionId) },
      });
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }
      if (question.userId !== req.user.id) {
        return res.status(403).json({ message: false });
      }
      return res.status(200).json({ message: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const questionId = req.params.id;
    const question = await prisma.question.findUnique({
      where: { id: parseInt(questionId) },
      select: {
        id: true,
        question: true,
        choices: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }
    return res.status(200).json(question);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/all", async (_: Request, res: Response) => {
  try {
    const questions = await prisma.question.findMany({
      select: {
        id: true,
        question: true,
        choices: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return res.status(200).json(questions);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/me", isUserLogin, async (req: UserRequest, res: Response) => {
  try {
    const questions = await prisma.question.findMany({
      where: { userId: req.user.id },
      select: {
        id: true,
        question: true,
        choices: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return res.status(200).json(questions);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get(
  "/info/:id",
  isUserLogin,
  isOwner,
  async (req: UserRequest, res: Response) => {
    try {
      const questionId = req.params.id;
      const question = await prisma.question.findUnique({
        where: { id: parseInt(questionId) },
        select: {
          id: true,
          question: true,
          choices: true,
          Answer: {
            select: {
              answer: true,
              user:
                req.user.package === "premium"
                  ? {
                      select: {
                        Gender: true,
                        DateOfBirth: true,
                      },
                    }
                  : false,
            },
          },
          createdAt: true,
          updatedAt: true,
        },
      });
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }
      return res.status(200).json(question);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

router.put(
  "/update/:id",
  isUserLogin,
  isOwner,
  async (req: UserRequest, res: Response) => {
    try {
      const questionId = req.params.id;
      const data = questionCreateSchema.parse(req.body);
      const question = await prisma.question.update({
        where: { id: parseInt(questionId) },
        data: {
          question: data.question,
          choices: data.choices,
        },
      });
      return res.status(200).json(question);
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

router.delete(
  "/delete/:id",
  isUserLogin,
  isOwner,
  async (req: UserRequest, res: Response) => {
    try {
      const questionId = req.params.id;
      await prisma.question.delete({ where: { id: parseInt(questionId) } });
      return res.status(200).json({ message: "Question deleted" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

export default router;
