import "server-only";

/**
 * STEP 0 — THE "DATABASE"
 *
 * We are not using a real database, so users live in this hard-coded array.
 * In a real app this would be a `users` table and these would be queries.
 *
 * Notice we NEVER store the plain password. We store a bcrypt hash of it.
 * bcrypt is a one-way, deliberately slow hash with a built-in random salt,
 * so even if this file leaked, attackers could not read the passwords.
 *
 * The hash below is for the password:  password123
 * Generate your own with:
 *   node -e "console.log(require('bcryptjs').hashSync('yourPassword', 10))"
 */

export type User = {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
};

const users: User[] = [
  {
    id: "1",
    username: "nancy23",
    email: process.env.DEMO_USER_EMAIL || "nancy@gmail.com",
    passwordHash: "$2b$10$IDg8lfH69dP6lJ4c20FELuf8zSq5atvdD.mcu8GynlMh2LoIUHgme",
  },
];

/** Find a user by username OR email (case-insensitive). */
export function findUserByIdentifier(identifier: string): User | undefined {
  const value = identifier.trim().toLowerCase();
  return users.find(
    (u) => u.username.toLowerCase() === value || u.email.toLowerCase() === value,
  );
}

export function findUserById(id: string): User | undefined {
  return users.find((u) => u.id === id);
}
