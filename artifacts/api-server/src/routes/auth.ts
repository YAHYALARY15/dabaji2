import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { usersTable, registerSchema, loginSchema } from "@workspace/db/schema";

const authRouter = Router();
const JWT_SECRET = process.env.SESSION_SECRET ?? "dabaji-secret-2026";
const JWT_EXPIRES = "30d";

authRouter.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Données invalides", details: parsed.error.issues });
    return;
  }

  const { firstName, lastName, phone, pin } = parsed.data;

  const existing = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.phone, phone))
    .limit(1);

  if (existing.length > 0) {
    res.status(409).json({ error: "Ce numéro est déjà enregistré" });
    return;
  }

  const pinHash = await bcrypt.hash(pin, 10);

  const [user] = await db
    .insert(usersTable)
    .values({ firstName, lastName, phone, pinHash })
    .returning({ id: usersTable.id, firstName: usersTable.firstName, lastName: usersTable.lastName, phone: usersTable.phone, createdAt: usersTable.createdAt });

  const token = jwt.sign({ userId: user.id, phone: user.phone }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

  res.status(201).json({ token, user });
});

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Données invalides" });
    return;
  }

  const { phone, pin } = parsed.data;

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.phone, phone))
    .limit(1);

  if (!user) {
    res.status(401).json({ error: "Numéro de téléphone non trouvé" });
    return;
  }

  const match = await bcrypt.compare(pin, user.pinHash);
  if (!match) {
    res.status(401).json({ error: "Code PIN incorrect" });
    return;
  }

  const token = jwt.sign({ userId: user.id, phone: user.phone }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

  res.json({
    token,
    user: { id: user.id, firstName: user.firstName, lastName: user.lastName, phone: user.phone, createdAt: user.createdAt },
  });
});

authRouter.get("/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Token manquant" });
    return;
  }

  const token = authHeader.slice(7);
  let payload: { userId: number };

  try {
    payload = jwt.verify(token, JWT_SECRET) as { userId: number };
  } catch {
    res.status(401).json({ error: "Token invalide ou expiré" });
    return;
  }

  const [user] = await db
    .select({ id: usersTable.id, firstName: usersTable.firstName, lastName: usersTable.lastName, phone: usersTable.phone, createdAt: usersTable.createdAt })
    .from(usersTable)
    .where(eq(usersTable.id, payload.userId))
    .limit(1);

  if (!user) {
    res.status(404).json({ error: "Utilisateur introuvable" });
    return;
  }

  res.json({ user });
});

export default authRouter;
