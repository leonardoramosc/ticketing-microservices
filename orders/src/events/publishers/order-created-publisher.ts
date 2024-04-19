import { OrderCreatedEvent, Publisher, Subjects } from "@microservices-tickets-course/common";


export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
