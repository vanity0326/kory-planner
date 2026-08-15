const { openStore } = require('./blobs-client');

// Reads one key out of the shared "kory-planner" blob store.
// Called like: /.netlify/functions/get-data?key=assignments
exports.handler = async (event) => {
  const key = event.queryStringParameters && event.queryStringParameters.key;

  if (!key) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing key parameter' }),
    };
  }

  try {
    const store = openStore();
    const value = await store.get(key, { type: 'json' });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      // value is null if the key has never been written yet — that's expected
      // on first run, and the frontend treats null as "start empty."
      body: JSON.stringify({ key, value }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to read data', detail: err.message }),
    };
  }
};
