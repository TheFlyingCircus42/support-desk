import { getPool, closePool } from "../db.js";

const USERS = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    email: "alice@example.com",
    name: "Alice Nguyen",
    password_hash: "placeholder-not-a-real-hash",
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    email: "bob@example.com",
    name: "Bob Fraser",
    password_hash: "placeholder-not-a-real-hash",
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    email: "carol@example.com",
    name: "Carol Diaz",
    password_hash: "placeholder-not-a-real-hash",
  },
  {
    id: "99999999-9999-9999-9999-999999999999",
    email: "dev@supportdesk.local",
    name: "Dana Okafor (agent)",
    password_hash: "placeholder-not-a-real-hash",
  },
];

const TICKETS = [
  {
    id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    subject: "Cannot log in to my account",
    status: "open",
    priority: "high",
    requester_id: "11111111-1111-1111-1111-111111111111",
    assignee_id: "99999999-9999-9999-9999-999999999999",
    description:
      "I keep getting an 'invalid credentials' error even after resetting my password twice.",
  },
  {
    id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    subject: "Billing charge looks incorrect",
    status: "pending",
    priority: "medium",
    requester_id: "22222222-2222-2222-2222-222222222222",
    assignee_id: "99999999-9999-9999-9999-999999999999",
    description:
      "My latest invoice shows two charges for the same subscription period.",
  },
  {
    id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
    subject: "How do I export my data?",
    status: "open",
    priority: "low",
    requester_id: "33333333-3333-3333-3333-333333333333",
    assignee_id: null,
    description:
      "I need to download all my account data before the end of the month for an audit.",
  },
];

async function seed(){
    const pool = getPool()
    const client = await pool.connect();

    try {
        await client.query("BEGIN");
        await client.query("TRUNCATE users RESTART IDENTITY CASCADE");

        for (const u of USERS){
            await client.query(
                `INSERT INTO users (id, email, name, password_hash) VALUES ($1, $2, $3, $4)`,
                [u.id, u.email, u.name, u.password_hash]
            );
        }

        for (const t of TICKETS){
            await client.query(
                `INSERT INTO tickets(id, subject, status, priority, requester_id, asignee_id, description)`,
                [t.id, t.subject, t.status, t.priority, t.requester_id, t.assignee_id, t.description]
            );
        }
    }
}