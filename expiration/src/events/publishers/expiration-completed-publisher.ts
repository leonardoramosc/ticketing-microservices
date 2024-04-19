import { ExpirationCompletedEvent, Publisher, Subjects } from "@microservices-tickets-course/common";

export class ExpirationCompletedPublisher extends Publisher<ExpirationCompletedEvent> {
  subject: Subjects.ExpirationCompleted = Subjects.ExpirationCompleted
}