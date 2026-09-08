import { sql } from 'drizzle-orm';
import { db } from '../db/client';

export const adminRepository = {
  async dashboardStats() {
    const [studentCount] = await db.execute<{ count: number }>(sql`SELECT COUNT(*)::int as count FROM users WHERE role = 'ALUNO'`).then(r => r.rows as any);
    const [activeStudents] = await db
      .execute<{ count: number }>(sql`SELECT COUNT(*)::int as count FROM users WHERE role = 'ALUNO' AND status = 'ATIVO'`)
      .then((r) => r.rows as any);
    const [publishedContents] = await db
      .execute<{ count: number }>(sql`SELECT COUNT(*)::int as count FROM contents WHERE status = 'PUBLICADO'`)
      .then((r) => r.rows as any);
    const [answeredQuestions] = await db.execute<{ count: number }>(sql`SELECT COUNT(*)::int as count FROM user_answers`).then((r) => r.rows as any);
    const [avgAccuracy] = await db
      .execute<{ avg: number | null }>(sql`SELECT AVG(CASE WHEN correct THEN 100.0 ELSE 0 END) as avg FROM user_answers`)
      .then((r) => r.rows as any);
    const [completionRate] = await db
      .execute<{ rate: number | null }>(
        sql`SELECT AVG(CASE WHEN completed THEN 100.0 ELSE 0 END) as rate FROM progress`,
      )
      .then((r) => r.rows as any);
    const [simulationsTaken] = await db.execute<{ count: number }>(sql`SELECT COUNT(*)::int as count FROM simulation_results`).then((r) => r.rows as any);
    const [userCounts] = await db.execute<any>(sql`SELECT
      COUNT(*)::int AS "totalUsers",
      COUNT(*) FILTER (WHERE role = 'MENTOR')::int AS "totalMentors",
      COUNT(*) FILTER (WHERE role = 'ADMIN')::int AS "totalAdmins",
      COUNT(*) FILTER (WHERE role = 'ALUNO' AND approved = true)::int AS "approvedStudents",
      COUNT(*) FILTER (WHERE subscription_plan = 'BASICO')::int AS "basicSubscriptions",
      COUNT(*) FILTER (WHERE subscription_plan = 'VITALICIO')::int AS "lifetimeSubscriptions",
      COUNT(*) FILTER (WHERE access_expires_at IS NOT NULL AND access_expires_at <= now())::int AS "expiredSubscriptions"
      FROM users`).then((r) => r.rows as any);
    const [databaseInfo] = await db.execute<any>(sql`SELECT
      current_database() AS "databaseName",
      pg_size_pretty(pg_database_size(current_database())) AS "databaseSize",
      (SELECT COUNT(*)::int FROM users) AS "userRecords",
      (SELECT COUNT(*)::int FROM courses) AS "courseRecords",
      (SELECT COUNT(*)::int FROM questions) AS "questionRecords",
      (SELECT COUNT(*)::int FROM simulation_results) AS "simulationRecords"`).then((r) => r.rows as any);

    return {
      totalStudents: studentCount?.count ?? 0,
      activeStudents: activeStudents?.count ?? 0,
      publishedContents: publishedContents?.count ?? 0,
      answeredQuestions: answeredQuestions?.count ?? 0,
      averageAccuracyPercent: avgAccuracy?.avg ? Math.round(Number(avgAccuracy.avg) * 100) / 100 : 0,
      contentCompletionRatePercent: completionRate?.rate ? Math.round(Number(completionRate.rate) * 100) / 100 : 0,
      simulationsTaken: simulationsTaken?.count ?? 0,
      totalUsers: userCounts?.totalUsers ?? 0,
      totalMentors: userCounts?.totalMentors ?? 0,
      totalAdmins: userCounts?.totalAdmins ?? 0,
      approvedStudents: userCounts?.approvedStudents ?? 0,
      basicSubscriptions: userCounts?.basicSubscriptions ?? 0,
      lifetimeSubscriptions: userCounts?.lifetimeSubscriptions ?? 0,
      expiredSubscriptions: userCounts?.expiredSubscriptions ?? 0,
      database: databaseInfo ?? { databaseName: 'Indisponível', databaseSize: 'Indisponível', userRecords: 0, courseRecords: 0, questionRecords: 0, simulationRecords: 0 },
    };
  },
};
