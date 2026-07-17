export function publicUser(user) {
  if (!user) return null;
  return { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt };
}

export function currentUser(user) {
  return { ...publicUser(user), connectBalance: user.connectBalance };
}
