import {
  Listener,
  OrderCreatedEvent,
  Subjects,
} from "@microservices-tickets-course/common";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { expirationQueue } from "../../queues/expiration-queue";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(
    data: OrderCreatedEvent["data"],
    msg: Message
  ): Promise<void> {
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime()
    console.log(`waiting ${delay} ms to process the job`)

    await expirationQueue.add(
      { orderId: data.id },
      {
        delay: delay
      }
    );

    msg.ack();
  }
}
