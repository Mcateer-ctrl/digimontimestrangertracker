const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  try {
    const filePath = path.join(__dirname, 'digimon.json');
    const digimonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    res.status(200).json(digimonData);
  } catch (error) {
    console.error('Error reading digimon data:', error);
    res.status(500).json({ error: 'Failed to load digimon data' });
  }
};
