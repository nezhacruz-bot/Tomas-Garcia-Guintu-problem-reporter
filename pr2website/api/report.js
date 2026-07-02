import { MongoClient } from "mongodb";

let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) return cachedDb;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Please define the MONGODB_URI environment variable");
  }

  const client = new MongoClient(uri);
  await client.connect();
  
  const db = client.db("school_website");
  cachedDb = db;
  return db;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  try {
    const db = await connectToDatabase();
    const collection = db.collection("reports");

    const { category, location, severity, description, role, date, status } = req.body;

    const newReport = {
      category,
      location,
      severity,
      description,
      role,
      date,
      status: status ?? "new",
      createdAt: new Date()
    };

    const result = await collection.insertOne(newReport);

    return res.status(200).json({ 
      success: true, 
      message: "Report saved safely to MongoDB!", 
      id: result.insertedId 
    });
  } catch (error) {
    console.error("MongoDB Database Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
