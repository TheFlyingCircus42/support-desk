export const up = (pgm) => {
  pgm.createTable("refresh_tokens", {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    user_id: {
      type: "uuid",
      notNull: true,
      references: "users",
    },
    family_id: { type: "uuid", notNull: true },
    token_hash: { type: "text", notNull: true, unique: true },
    created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
    expires_at: { type: "timestamptz", notNull: true },
    revoked_at: { type: "timestamptz", notNull: false },
  });

  // token_hash's `unique: true` above already backs it with a unique index —
  // an explicit createIndex here would just be a redundant duplicate.
  pgm.createIndex("refresh_tokens", "family_id");
};

export const down = (pgm) => {
  pgm.dropTable("refresh_tokens");
};
