const express = require('express');
const path = require('path');
const app = express();

const https = require('https');
const fs = require('fs');
const port = 3000;

// 静的ファイルの提供
app.use(express.static(path.join(__dirname, 'public')));

// ルートへのリクエストを処理
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// HTTPSサーバーのオプション
const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

// HTTPSサーバーの作成
https.createServer(options, app).listen(port, () => {
  console.log(`Server running at https://localhost:${port}/`);
});