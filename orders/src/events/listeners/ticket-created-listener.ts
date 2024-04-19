import {
  Listener,
  Subjects,
  TicketCreatedEvent,
} from "@microservices-tickets-course/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { queueGroupName } from "./queue-group-name";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
  queueGroupName = queueGroupName;

  async onMessage(
    data: TicketCreatedEvent["data"],
    msg: Message
  ): Promise<void> {
    const { id, title, price, version } = data;

    const ticket = Ticket.build({
      id,
      price,
      title
    });

    await ticket.save();

    msg.ack();
  }
}
