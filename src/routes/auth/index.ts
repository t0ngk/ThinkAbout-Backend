import { Router, Request, Response } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../../libs/prisma";
import isUserLogin from "../../libs/middlewares/isUserLogin";
import { UserRequest } from "../../libs/types/UserRequest";

const router = Router();

const userRegisterSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
  confirmPassword: z.string().min(6),
  gender: z.string(),
  dateOfBirth: z.string(),
});

const userEditSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  gender: z.string().optional(),
  dateOfBirth: z.string().optional(),
});

const userLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

router.post("/register", async (req: Request, res: Response) => {
  try {
    const data = userRegisterSchema.parse(req.body);
    if (data.password !== data.confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    const isEmailTaken = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (isEmailTaken) {
      return res.status(400).json({ message: "Email already taken" });
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        Gender: data.gender,
        DateOfBirth: new Date(data.dateOfBirth),
      },
    });
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!);
    return res.status(201).json({ token });
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

router.post("/login", async (req: Request, res: Response) => {
  try {
    const data = userLoginSchema.parse(req.body);
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!);
    return res.json({ token });
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

router.get("/me", async (req: Request, res: Response) => {
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
      },
    });
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    return res.json(user);
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: "Unauthorized" });
  }
});

router.put("/me", isUserLogin, async (req: UserRequest, res: Response) => {
  try {
    const data = userEditSchema.parse(req.body);
    await prisma.user.update({
      where: { id: req.user?.id },
      data: {
        name: data.name || req.user.name,
        email: data.email || req.user.email,
        Gender: data.gender || req.user.gender,
        DateOfBirth: new Date(data.dateOfBirth || req.user.DateOfBirth),
      },
    });
    return res.status(200).json({ message: "User updated" });
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

export default router;
