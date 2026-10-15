// File: api/overpass.js
export default async function handler(req, res) {
  // Set CORS Headers untuk mengizinkan frontend mengakses Serverless Function ini
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const query = `[out:json][timeout:25];(node["amenity"="fuel"](-8.95,114.43,-8.05,115.75);way["amenity"="fuel"](-8.95,114.43,-8.05,115.75););out center;`;
  const encodedQuery = encodeURIComponent(query);

  const mirrors = [
    `https://overpass-api.de/api/interpreter?data=${encodedQuery}`,
    `https://overpass.kumi.systems/api/interpreter?data=${encodedQuery}`,
    `https://lz4.overpass-api.de/api/interpreter?data=${encodedQuery}`,
    `https://overpass.private.coffee/api/interpreter?data=${encodedQuery}`
  ];

  for (const mirrorUrl of mirrors) {
    try {
      // Panggilan Server-to-Server menyertakan User-Agent agar tidak terblokir HTTP 406
      const response = await fetch(mirrorUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'PantauSPBUBaliApp/1.0 (https://spbuliveserver.vercel.app)'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return res.status(200).json(data);
      }
    } catch (err) {
      console.error(`Mirror failed: ${mirrorUrl}`, err);
    }
  }

  return res.status(500).json({ error: 'Seluruh server Overpass sedang tidak merespon' });
}
