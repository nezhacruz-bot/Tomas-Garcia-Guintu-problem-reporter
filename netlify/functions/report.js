import { getDatabase } from "@netlify/database";

export const handler = async (event) => {
  // 1. Connection & Method Verification
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const db = getDatabase();

    // 2. Full Verification of Incoming Data Lifecycle
    const { id, category, location, severity, description, role, date, status } = JSON.parse(event.body);

    if (!category || !location || !severity || !role) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, error: "Missing required fields." }),
      };
    }

    // 3. Connection lifecycle management: Ensure Schema is ready
    await db.sql`
      CREATE TABLE IF NOT EXISTS reports (
        id BIGINT PRIMARY KEY,
        category TEXT,
        location TEXT,
        severity TEXT,
        description TEXT,
        role TEXT,
        date TEXT,
        status TEXT
      );
    `;

    // 4. Executing secure parameterized query via Netlify Database primitives
    await db.sql`
      INSERT INTO reports (id, category, location, severity, description, role, date, status)
      VALUES (${id || Date.now()}, ${category}, ${location}, ${severity}, ${description}, ${role}, ${date}, ${status ?? "new"})
      ON CONFLICT (id) DO NOTHING;
    `;

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: true, message: "Report successfully saved to Netlify Database Postgres!" }),
    };
  } catch (error) {
    console.error("Netlify Database Execution Error:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
};
