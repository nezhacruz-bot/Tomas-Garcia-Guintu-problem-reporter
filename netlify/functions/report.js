import { getDatabase } from "@netlify/database";

const db = getDatabase();

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { category, location, severity, description, role, date, status } =
      JSON.parse(event.body);

    await db.sql`
      INSERT INTO reports (category, location, severity, description, role, date, status)
      VALUES (${category}, ${location}, ${severity}, ${description}, ${role}, ${date}, ${status ?? "new"})
    `;

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: true, message: "Report saved!" }),
    };
  } catch (error) {
    console.error("Database error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
};
