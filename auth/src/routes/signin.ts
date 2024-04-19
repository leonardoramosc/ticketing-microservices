import express, { Request, Response } from "express";
import { body } from "express-validator";
import { User } from "../models/user";
import { BadRequestError, validateRequest } from "@microservices-tickets-course/common";
import { Password } from "../services/password";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post(
  "/api/users/signin",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("You must supply a password"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    const invalidCredentialsMsg = "Invalid credentials";

    if (!existingUser) {
      throw new BadRequestError(invalidCredentialsMsg);
    }

    const isPasswordCorrect = await Password.compare(
      existingUser.password,
      password
    );

    if (!isPasswordCorrect) {
      throw new BadRequestError(invalidCredentialsMsg);
    }

    const userJwt = jwt.sign(
      {
        id: existingUser.id,
        email: existingUser.email,
      },
      process.env.JWT_KEY!
    );

    req.session = {
      jwt: userJwt,
    };

    res.send(existingUser);
  }
);

export { router as signinRouter };
