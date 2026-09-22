function toPublicUser(row) {
  if (!row) return null;
  const { password_hash, ...publicUser } = row;
  return publicUser;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

module.exports = { toPublicUser, isValidEmail };
