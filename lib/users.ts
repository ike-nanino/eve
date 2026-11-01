import "server-only";


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
    email: process.env.DEMO_USER_EMAIL || "nancyberry@gmail.com",
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
