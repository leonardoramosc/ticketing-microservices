import express from "express";

import { currentUser } from "@microservices-tickets-course/common";

const router = express.Router();

router.get("/api/users/currentuser", currentUser, (req, res) => {
  const { currentUser } = req;
  res.send({ currentUser });
});

export { router as currentUserRouter };
