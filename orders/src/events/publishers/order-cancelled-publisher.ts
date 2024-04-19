import { OrderCancelledEvent, Publisher, Subjects } from "@microservices-tickets-course/common";


export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}