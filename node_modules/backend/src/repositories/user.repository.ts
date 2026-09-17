import { and, eq, sql } from 'drizzle-orm';
import { db } from '../db/client';
import { users, profiles, gamification } from '../db/schema';

export type NewUser = typeof users.$inferInsert;
export type UserRow = typeof users.$inferSelect;

export const userRepository = {
  async findByEmail(email: string): Promise<UserRow | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim()));
    return user;
  },

  async findById(id: string): Promise<UserRow | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  },

  async create(data: { name: string; email: string; passwordHash: string; role?: 'ALUNO' | 'ADMIN' | 'MENTOR' }) {
    const [user] = await db
      .insert(users)
      .values({
        name: data.name,
        email: data.email.toLowerCase().trim(),
        passwordHash: data.passwordHash,
        role: data.role ?? 'ALUNO',
      })
      .returning();

    // Toda criação de usuário já nasce com perfil e registro de gamificação
    // associados, evitando checagens de "existe ou não" espalhadas pelo código.
    await db.insert(profiles).values({ userId: user.id });
    await db.insert(gamification).values({ userId: user.id });

    return user;
  },

  async updateLastLogin(id: string) {
    await db.update(users).set({ lastLoginAt: new Date(), failedLoginAttempts: 0, lockedUntil: null }).where(eq(users.id, id));
  },

  async registerFailedLogin(id: string, maxAttempts: number, lockMinutes: number) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    if (!user) return;
    const attempts = user.failedLoginAttempts + 1;
    const shouldLock = attempts >= maxAttempts;
    await db
      .update(users)
      .set({
        failedLoginAttempts: attempts,
        lockedUntil: shouldLock ? new Date(Date.now() + lockMinutes * 60 * 1000) : user.lockedUntil,
      })
      .where(eq(users.id, id));
  },

  async updatePassword(id: string, passwordHash: string) {
    await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, id));
  },

  async updateProfileBasics(id: string, data: { name?: string; photoUrl?: string }) {
    const [user] = await db.update(users).set({ ...data, updatedAt: new Date() }).where(eq(users.id, id)).returning();
    return user;
  },

  async setStatus(id: string, status: 'ATIVO' | 'INATIVO') {
    const [user] = await db.update(users).set({ status, updatedAt: new Date() }).where(eq(users.id, id)).returning();
    return user;
  },

  async setRole(id: string, role: 'ALUNO' | 'ADMIN' | 'MENTOR') {
    const [user] = await db.update(users).set({ role, updatedAt: new Date() }).where(eq(users.id, id)).returning();
    return user;
  },

  async markApproved(id: string, approved: boolean) {
    const [user] = await db
      .update(users)
      .set({ approved, approvedAt: approved ? new Date() : null, accessExpiresAt: approved ? sql`coalesce(${users.accessExpiresAt}, now()) + interval '60 days'` : undefined, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  },

  async activateSubscription(id: string, plan: 'BASICO' | 'VITALICIO') {
    const [user] = await db
      .update(users)
      .set({
        subscriptionPlan: plan,
        accessExpiresAt: plan === 'BASICO' ? sql`now() + interval '90 days'` : null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  },

  async list(params: { search?: string; page: number; pageSize: number; role?: 'ALUNO' | 'ADMIN' | 'MENTOR' }) {
    const { search, page, pageSize, role } = params;
    const offset = (page - 1) * pageSize;

    const searchClause = search
      ? sql`(${users.name} ILIKE ${'%' + search + '%'} OR ${users.email} ILIKE ${'%' + search + '%'})`
      : undefined;
    const whereClause = role ? and(eq(users.role, role), searchClause) : searchClause;

    const rows = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        status: users.status,
        subscriptionPlan: users.subscriptionPlan,
        accessExpiresAt: users.accessExpiresAt,
        approved: users.approved,
        approvedAt: users.approvedAt,
        createdAt: users.createdAt,
        lastLoginAt: users.lastLoginAt,
      })
      .from(users)
      .where(whereClause)
      .limit(pageSize)
      .offset(offset)
      .orderBy(users.createdAt);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(whereClause);

    return { rows, total: count };
  },

  async listStudentsWithProgress(params: { search?: string; page: number; pageSize: number }) {
    const { search, page, pageSize } = params;
    const offset = (page - 1) * pageSize;
    const searchPattern = search?.trim() ? `%${search.trim()}%` : null;

    const result = await db.execute(sql`
      WITH filtered_students AS (
        SELECT
          u.id,
          u.name,
          u.email,
          u.role,
          u.status,
          u.subscription_plan AS "subscriptionPlan",
          u.access_expires_at AS "accessExpiresAt",
          u.approved,
          u.approved_at AS "approvedAt",
          u.created_at AS "createdAt",
          u.last_login_at AS "lastLoginAt"
        FROM users u
        WHERE u.role = 'ALUNO'
          AND (${searchPattern}::text IS NULL OR u.name ILIKE ${searchPattern} OR u.email ILIKE ${searchPattern})
        ORDER BY u.created_at
        LIMIT ${pageSize}
        OFFSET ${offset}
      )
      SELECT
        fs.id,
        fs.name,
        fs.email,
        fs.role,
        fs.status,
        fs."subscriptionPlan",
        fs."accessExpiresAt",
        fs.approved,
        fs."approvedAt",
        fs."createdAt",
        fs."lastLoginAt",
        m.id AS "moduleId",
        m.title AS "moduleTitle",
        COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'PUBLICADO')::int AS "totalContents",
        COUNT(DISTINCT p.content_id) FILTER (WHERE p.completed = true)::int AS "completedContents",
        COALESCE(ROUND(AVG(p.percent) FILTER (WHERE c.status = 'PUBLICADO')), 0)::int AS "progressPercent",
        COUNT(DISTINCT ua.id)::int AS "answeredQuestions",
        COUNT(DISTINCT ua.id) FILTER (WHERE ua.correct = true)::int AS "correctAnswers",
        MAX(COALESCE(p.started_at, ua.answered_at)) AS "lastActivityAt"
      FROM filtered_students fs
      LEFT JOIN modules m ON true
      LEFT JOIN contents c ON c.module_id = m.id
      LEFT JOIN progress p ON p.content_id = c.id AND p.user_id = fs.id
      LEFT JOIN questions q ON q.module_id = m.id
      LEFT JOIN user_answers ua ON ua.question_id = q.id AND ua.user_id = fs.id
      GROUP BY fs.id, fs.name, fs.email, fs.role, fs.status, fs."subscriptionPlan", fs."accessExpiresAt", fs.approved, fs."approvedAt", fs."createdAt", fs."lastLoginAt", m.id, m.title, m."order"
      ORDER BY fs."createdAt", m."order"
    `);

    const rows = result.rows as Array<{
      id: string;
      name: string;
      email: string;
      role: 'ALUNO';
      status: 'ATIVO' | 'INATIVO';
      subscriptionPlan: 'BASICO' | 'VITALICIO' | null;
      accessExpiresAt: string | null;
      approved: boolean;
      approvedAt: string | null;
      createdAt: string;
      lastLoginAt: string | null;
      moduleId: string | null;
      moduleTitle: string | null;
      totalContents: number;
      completedContents: number;
      progressPercent: number;
      answeredQuestions: number;
      correctAnswers: number;
      lastActivityAt: string | null;
    }>;

    const students = new Map<string, {
      id: string;
      name: string;
      email: string;
      role: 'ALUNO';
      status: 'ATIVO' | 'INATIVO';
      subscriptionPlan: 'BASICO' | 'VITALICIO' | null;
      accessExpiresAt: string | null;
      approved: boolean;
      approvedAt: string | null;
      createdAt: string;
      lastLoginAt: string | null;
      modules: Array<{
        id: string;
        title: string;
        progressPercent: number;
        completedContents: number;
        totalContents: number;
        accuracyPercent: number | null;
        lastActivityAt: string | null;
      }>;
    }>();

    for (const row of rows) {
      const student = students.get(row.id) ?? {
        id: row.id,
        name: row.name,
        email: row.email,
        role: row.role,
        status: row.status,
        subscriptionPlan: row.subscriptionPlan,
        accessExpiresAt: row.accessExpiresAt,
        approved: row.approved,
        approvedAt: row.approvedAt,
        createdAt: row.createdAt,
        lastLoginAt: row.lastLoginAt,
        modules: [],
      };
      const accuracyPercent = row.answeredQuestions > 0
        ? Math.round((row.correctAnswers / row.answeredQuestions) * 100)
        : null;
      if (row.moduleId) {
        student.modules.push({
          id: row.moduleId,
          title: row.moduleTitle ?? '',
          progressPercent: row.progressPercent,
          completedContents: row.completedContents,
          totalContents: row.totalContents,
          accuracyPercent,
          lastActivityAt: row.lastActivityAt,
        });
      }
      students.set(row.id, student);
    }

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(and(eq(users.role, 'ALUNO'), searchPattern ? sql`(${users.name} ILIKE ${searchPattern} OR ${users.email} ILIKE ${searchPattern})` : undefined));

    return { rows: Array.from(students.values()), total: count };
  },

  async count() {
    const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(users);
    return count;
  },
};
