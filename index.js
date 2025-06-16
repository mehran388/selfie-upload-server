const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '5mb' }));

const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

app.post('/upload', (req, res) => {
  const { image } = req.body;

  if (!image || !image.startsWith('data:image/')) {
    return res.status(400).send('Invalid image data.');
  }

  const match = image.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!match) return res.status(400).send('Image format not recognized.');

  const ext = match[1];
  const base64Data = match[2];
  const filename = `selfie_${uuidv4()}.${ext}`;

  fs.writeFile(path.join(UPLOAD_DIR, filename), Buffer.from(base64Data, 'base64'), (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Failed to save image.');
    }
    res.send(`✅ Uploaded as ${filename}`);
  });
});

app.use('/uploads', express.static(UPLOAD_DIR));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));