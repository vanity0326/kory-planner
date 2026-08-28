const { openStore } = require('./blobs-client');

// Writes one key into the shared "kory-planner" blob store.
// Called with a POST body like: { "key": "assignments", "value": [...] }
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Use POST' }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  const { key, value } = payload;
  if (!key) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing key' }) };
  }

  try {
    const store = openStore();
    await store.setJSON(key, value);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, saved: true }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to save data', detail: err.message }),
    };
  }
};
