const express = require('express');
const multer = require('multer');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
dotenv.config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

app.post('/analyze', upload.single('photo'), async (req, res) => {
  console.log('📥 Fotoğraf geldi mi?', req.file);
  const mood = req.body.mood;
  console.log('🧠 Ruh hali:', mood);

  if (!mood) {
    return res.status(400).json({ error: "Ruh hali bilgisi eksik." });
  }

  try {
    const geminiPrompt = `
      Kullanıcının ruh hali: "${mood}".
      Bu ruh haline uygun 3 Türkçe şarkı öner.
      Format:
      Ruh Hali: ...
      Önerilen Şarkılar:
      1. ...
      2. ...
      3. ...
    `;

    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent',

      {
        contents: [{ parts: [{ text: geminiPrompt }] }],
      },
      {
        headers: { 'Content-Type': 'application/json' },
        params: { key: process.env.GEMINI_API_KEY },
      }
    );

    const result = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "Yanıt alınamadı.";
    res.json({ result });
  } catch (error) {
    console.error("❌ Hata:", error?.response?.data || error);
    res.status(500).json({ error: error?.response?.data?.error?.message || "İşlem sırasında hata oluştu." });
  }
});

app.listen(port, () => {
  console.log(`🚀 Sunucu http://localhost:${port} adresinde çalışıyor`);
});
