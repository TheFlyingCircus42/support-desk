// In-memory sample support tickets. No database — this array lives in process
// memory and resets on restart.
export const tickets = [
  {
    id: 1,
    subject: "Cannot log in to my account",
    status: "open",
    priority: "high",
    requester: "alice@example.com",
  },
  {
    id: 2,
    subject: "Feature request: dark mode",
    status: "pending",
    priority: "low",
    requester: "bob@example.com",
  },
  {
    id: 3,
    subject: "Invoice shows the wrong amount",
    status: "open",
    priority: "medium",
    requester: "carol@example.com",
  },
];
