const express = require('express');
const path = require('path');
const app = express();

// 静的ファイルの提供
app.use(express.static(path.join(__dirname, 'public')));

// ルートへのリクエストを処理
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// サーバーを起動
const port = 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});