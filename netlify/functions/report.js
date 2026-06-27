const couchbase = require('couchbase');

exports.handler = async (event, context) => {
  // Only allow POST requests (submitting data)
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let cluster;
  try {
    const body = JSON.parse(event.body);

    // Connect to Couchbase Capella using your secure Netlify variables
    cluster = await couchbase.connect(process.env.COUCHBASE_URL, {
      username: process.env.COUCHBASE_USER,
      password: process.env.COUCHBASE_PASSWORD,
    });

    const bucket = cluster.bucket('school_reports');
    const collection = bucket.defaultCollection();

    // Create a unique ID for this report entry
    const reportId = `report_${Date.now()}`;
    
    // Save the report data into the bucket
    await collection.upsert(reportId, {
      ...body,
      createdAt: new Date().toISOString()
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, message: 'Report saved to cloud database!' })
    };
  } catch (error) {
    console.error('Database error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message })
    };
  } finally {
    if (cluster) await cluster.close();
  }
};