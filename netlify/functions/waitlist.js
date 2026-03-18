exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { email, role, timestamp } = JSON.parse(event.body || '{}');

  if (!email || !email.includes('@')) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid email' }) };
  }

  const AIRTABLE_TOKEN  = process.env.AIRTABLE_TOKEN;
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
  const AIRTABLE_TABLE  = 'Waitlist';

  const response = await fetch(
    `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          Email: email,
          Role: role || '',
          Timestamp: timestamp || new Date().toISOString(),
        },
      }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    console.error('Airtable error:', response.status, text);
    return { statusCode: 502, body: JSON.stringify({ error: 'Upstream error' }) };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ ok: true }),
  };
};
