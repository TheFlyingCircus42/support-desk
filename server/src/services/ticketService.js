import { findAll, findById, countAll, countByStatus } from "../repositories/ticketRepository.js";
import { AppError } from "../errors/AppError.js";

export async function listTickets() {
  return await findAll();
}

export async function getTicketById(id) {
  const ticket = await findById(id);

  if (!ticket) {
    throw AppError.notFound(`Ticket ${id} not found`);
  }

  return ticket;
}

export async function countTickets() {
  return await countAll();
}

export async function countOpenTickets() {
  return await countByStatus("open");
}
