import {
  Publisher,
  Subjects,
  TicketUpdatedEvent,
} from "@microservices-tickets-course/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}
