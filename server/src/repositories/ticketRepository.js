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


// findAll
export async function findAll() {
    const { rows } = await query(
        `${SELECT_TICKET}
         ORDER BY
            CASE t.priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END,
            t.created_at`
    )
    return rows;
}

// findById
export async function findById(id) {
  const { rows } = await query(`${SELECT_TICKET} WHERE t.id = $1`, [id]);
  return rows[0] || null;
}

// countByStatus
export async function countByStatus(status) {
  const { rows } = await query(
    `SELECT count(*)::int AS count FROM tickets WHERE status = $1`,
    [status]
  );
  return rows[0].count;
}

// countAll
export async function countAll() {
  const { rows } = await query(`SELECT count(*)::int AS count FROM tickets`);
  return rows[0].count;
}
