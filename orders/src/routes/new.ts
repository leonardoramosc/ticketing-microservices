import {
  BadRequestError,
  NotFoundError,
  OrderStatus,
  requireAuth,
} from "@microservices-tickets-course/common";
import express, { Request, Response } from "express";
import { body } from "express-validator";
import { Ticket } from "../models/ticket";
import { Order } from "../models/order";
import { OrderCreatedPublisher } from "../events/publishers/order-created-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 1 * 60;

router.post(
  "/api/orders",
  requireAuth,
  [body("ticketId").notEmpty().withMessage("TicketId must be provided")],
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      throw new NotFoundError();
    }

    // make sure that this ticket is not reserved
    const isReserved = await ticket.isReserved();

    if (isReserved) {
      throw new BadRequestError(`Ticket is already reserved`);
    }

    // calculate expiration date for this ticket
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    // build order and save in DB
    const order = Order.build({
      userId: req.currentUser!.id,
      expiresAt: expiration,
      ticket: ticket,
      status: OrderStatus.CREATED
    });

    await order.save()

    new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      status: order.status,
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(),
      version: order.version,
      ticket: {
        id: ticket.id,
        price: ticket.price
      },
    })
    res.status(201).send(order);
  }
);

export { router as createOrderRouter };
