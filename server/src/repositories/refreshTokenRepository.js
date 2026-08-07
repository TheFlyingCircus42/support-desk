import { query } from "../db.js";

// create
// familyId is passed in, not generated here — the service layer decides
// whether to start a new family or continue an existing one.
export async function create({ userId, familyId, tokenHash, expiresAt }) {
  const { rows } = await query(
    `INSERT INTO refresh_tokens (user_id, family_id, token_hash, expires_at)
     VALUES ($1, $2, $3, $4)
     RETURNING id, family_id`,
    [userId, familyId, tokenHash, expiresAt]
  );
  return rows[0];
}

// findByHash
// The only read path for refresh tokens — no findAll, no listing by user.
export async function findByHash(tokenHash) {
  const { rows } = await query(`SELECT * FROM refresh_tokens WHERE token_hash = $1`, [
    tokenHash,
  ]);
  return rows[0] || null;
}

// revoke
// Retires the one token that was just presented/rotated. Not the same
// operation as revokeFamily below — see its comment.
export async function revoke(id) {
  await query(
    `UPDATE refresh_tokens SET revoked_at = now() WHERE id = $1 AND revoked_at IS NULL`,
    [id]
  );
}

// revokeFamily
// The reuse-detection response — kills every token in a lineage in one
// statement, not just the one presented. Deliberately separate from
// revoke(id): "kill the whole lineage" and "retire the token I just used
// for rotation" are different operations with very different consequences,
// and giving them different names keeps them from being confused for each
// other under a generic invalidate(id).
export async function revokeFamily(familyId) {
  await query(
    `UPDATE refresh_tokens SET revoked_at = now() WHERE family_id = $1 AND revoked_at IS NULL`,
    [familyId]
  );
}
