import { query } from "../db.js";

const SELECT_TICKET = `
    SELECT
        t.id, t.subject, t.description, t.status, t.priority,
        t.created_at, t.updated_at,
        r.email AS requester,
        r.name AS requester_name,
        a.email AS assignee,
        a.name AS assignee_name
    FROM tickets t
    JOIN users r ON r.id = t.requester_id
    LEFT JOIN users a ON a.id = t.assignee_id
`;

// (t.requester_id = <placeholder> OR t.assignee_id = <placeholder>) — the one place
// "ownership" of a ticket is defined. `placeholder` is a parameter name like "$1",
// never a value; the actual user id is always passed through query()'s params array.
function visibleTo(placeholder) {
  return `(t.requester_id = ${placeholder} OR t.assignee_id = ${placeholder})`;
}

// findAllVisibleTo
export async function findAllVisibleTo(userId) {
  const { rows } = await query(
    `${SELECT_TICKET}
     WHERE ${visibleTo("$1")}
     ORDER BY
        CASE t.priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END,
        t.created_at`,
    [userId]
  );
  return rows;
}

// findByIdVisibleTo
// Returns null both when the ticket doesn't exist and when it exists but isn't
// visible to userId — the two cases are indistinguishable by design.
export async function findByIdVisibleTo(id, userId) {
  const { rows } = await query(
    `${SELECT_TICKET} WHERE t.id = $1 AND ${visibleTo("$2")}`,
    [id, userId]
  );
  return rows[0] || null;
}

// countByStatusVisibleTo
export async function countByStatusVisibleTo(status, userId) {
  const { rows } = await query(
    `SELECT count(*)::int AS count
     FROM tickets t
     WHERE t.status = $1 AND ${visibleTo("$2")}`,
    [status, userId]
  );
  return rows[0].count;
}

// Deliberately unscoped — the only caller is the /api/ready health check, which needs
// a raw table count with no notion of a requesting user. Every other query in this file
// is visibility-scoped; this is the one intentional exception, not an oversight.
export async function countAll() {
  const { rows } = await query(`SELECT count(*)::int AS count FROM tickets`);
  return rows[0].count;
}
