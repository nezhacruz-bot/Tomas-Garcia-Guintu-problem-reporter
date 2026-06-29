import couchbase from "couchbase";

// 1. Initialize the Couchbase connection using your environment variables
let cluster = null;

async function getCouchbaseBucket() {
  if (!cluster) {
    // These environment variables must match your Capella Connection String, Username, and Password
    const connectionString = process.env.COUCHBASE_URL || "couchbases://cb.<your-cluster-id>.cloud.couchbase.com";
    const username = process.env.COUCHBASE_USERNAME;
    const password = process.env.COUCHBASE_PASSWORD;

    cluster = await couchbase.connect(connectionString, {
      username: username,
      password: password,
      // Capella requires TLS, configuration defaults usually handle this but you can specify custom settings if needed
    });
  }
  
  // Connect to your specific bucket
  const bucket = cluster.bucket("school_reports");
  const scope = bucket.scope("_default");
  const collection = scope.collection("_default");
  
  return collection;
}

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const reportData = JSON.parse(event.body);
    
    // Fallback default status if not provided
    if (!reportData.status) {
      reportData.status = "new";
    }

    // Generate a unique document ID using the timestamp
    const docId = `report::${reportData.id || Date.now()}`;

    // 2. Get our Couchbase collection reference
    const collection = await getCouchbaseBucket();

    // 3. Insert the document directly into your Couchbase bucket
    await collection.insert(docId, reportData);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: true, message: "Report saved to Couchbase!", id: docId }),
    };
  } catch (error) {
    console.error("Couchbase Database error:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
};
