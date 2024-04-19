import {
  NotFoundError, validateRequest,
} from "@microservices-tickets-course/common";
import express, { Request, Response } from "express";

import { Ticket } from "../models/ticket";
import { param } from "express-validator";

const router = express.Router();

router.get(
  "/api/tickets/:id",
  param('id').isMongoId().withMessage('Invalid ticket id'),
  validateRequest,
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const ticket = await Ticket.findById(id);

    if (!ticket) {
      throw new NotFoundError();
    }

    res.json(ticket);
  }
);

export { router as showTicketRouter };
