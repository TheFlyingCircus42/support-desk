export const up = (pgm) => {
  pgm.addColumn("users", {
    last_login_at: {
      type: "timestamptz",
    },
  });
};

export const down = (pgm) => {
  pgm.dropColumn("users", "last_login_at");
};