import * as ticketRepository from "../repositories/ticketRepository.js";
import { AppError } from "../errors/AppError.js";

export async function listTicketsFor(userId) {
  return ticketRepository.findAllVisibleTo(userId);
}

export async function countOpenTicketsFor(userId) {
  return ticketRepository.countByStatusVisibleTo("open", userId);
}

export async function getTicketByIdFor(id, userId) {
  const ticket = await ticketRepository.findByIdVisibleTo(id, userId);
  if (!ticket) {
    // Same 404 whether the ticket doesn't exist or just isn't this user's — a 403
    // here would confirm the id is real, letting an attacker walk the id space to
    // map out which tickets exist. A 404 leaks nothing either way.
    throw AppError.notFound(`Ticket ${id} not found`);
  }
  return ticket;
}

// Deliberately unscoped — only for the /api/ready probe, never for a user's own
// question about their tickets.
export async function countTickets() {
  return ticketRepository.countAll();
}
