export const up = (pgm) => {
  pgm.createType("ticket_status", ["open", "pending", "closed"]);
  pgm.createType("ticket_priority", ["low", "medium", "high"]);
  pgm.createTable("tickets", {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    subject: { type: "text", notNull: true },
    description: { type: "text", notNull: true, default: "" },
    status: { type: "ticket_status", notNull: true, default: "open" },
    priority: { type: "ticket_priority", notNull: true, default: "medium" },
    requester_id: {
      type: "uuid",
      notNull: true,
      references: "users",
      onDelete: "CASCADE",
    },
    assignee_id: {
      type: "uuid",
      notNull: false,
      references: "users",
      onDelete: "SET NULL",
    },
    created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
    updated_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
  });

    pgm.addConstraint("tickets", "tickets_subject_not_blank", {
    check: "length(trim(subject)) > 0",
  });
  pgm.createIndex("tickets", "requester_id");
  pgm.createIndex("tickets", "assignee_id");
  pgm.createIndex("tickets", "status");
  pgm.sql(`
    CREATE TRIGGER tickets_set_updated_at
    BEFORE UPDATE ON tickets
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  `);
};
export const down = (pgm) => {
  pgm.dropTable("tickets");
  pgm.dropType("ticket_priority");
  pgm.dropType("ticket_status");
};