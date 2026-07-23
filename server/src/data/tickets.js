// In-memory sample support tickets. No database — this array lives in process
// memory and resets on restart.
export const tickets = [
  {
    id: 1,
    subject: "Cannot log in to my account",
    status: "open",
    priority: "high",
    requester: "alice@example.com",
    description:
      "Customer gets an 'invalid credentials' error even after resetting their password twice. Started yesterday afternoon.",
  },
  {
    id: 2,
    subject: "Feature request: dark mode",
    status: "pending",
    priority: "low",
    requester: "bob@example.com",
    description:
      "Customer would like a dark theme option for the dashboard to reduce eye strain during night shifts.",
  },
  {
    id: 3,
    subject: "Invoice shows the wrong amount",
    status: "open",
    priority: "medium",
    requester: "carol@example.com",
    description:
      "This month's invoice charged for 15 seats but the account only has 10 active users. Needs a corrected invoice.",
  },
];
