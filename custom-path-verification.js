// verify-custom-paths.js
const fs = require('fs');
const path = require('path');

const basePath = '/home/sakiya03/デスクトップ/self_dev/web-ar-3dmodeltest/public/js/three';

const paths = [
  'three.module.js',
  'examples/jsm/loaders/OBJLoader.js',
  'examples/jsm/loaders/FontLoader.js',
  'examples/jsm/geometries/TextGeometry.js'
];

paths.forEach(p => {
  const fullPath = path.join(basePath, p);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ File exists: ${fullPath}`);
  } else {
    console.log(`❌ File does not exist: ${fullPath}`);
  }
});

// モジュールの読み込みを試みる
// 注意: Node.jsではES6モジュールの動的インポートに制限があるため、この部分はコメントアウトしています
/*
paths.forEach(async (p) => {
  try {
    const module = await import(path.join(basePath, p));
    console.log(`✅ Module can be imported: ${p}`);
  } catch (error) {
    console.log(`❌ Module cannot be imported: ${p}`);
    console.error(error);
  }
});
*/
