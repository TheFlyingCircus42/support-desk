import { tickets } from "../data/tickets.js";

export function listTickets() {
  return tickets;
}

export function getTicketById(id) {
  const numericId = Number(id);
  const ticket = tickets.find((t) => t.id === numericId);

  if (!ticket) {
    throw new Error(`Ticket ${id} not found`);
  }

  return ticket;
}
