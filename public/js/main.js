import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

// サイズを指定
const width = window.innerWidth;
const height = window.innerHeight;

// レンダラーを作成
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#myCanvas')
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(width, height);

// シーンを作成
const scene = new THREE.Scene();

// カメラを作成
const camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
camera.position.set(0, 0, +1000);

// 環境光源を作成
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// 平行光源を作成
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// カメラの映像を取得
let video;
let videoTexture;
let videoMaterial;
let videoMesh;

async function setupVideo() {
  video = document.createElement('video');
  video.autoplay = true;
  video.muted = true;
  video.playsInline = true;
  
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    video.srcObject = stream;
    await video.play();

    console.log('Video dimensions:', video.videoWidth, video.videoHeight);

    videoTexture = new THREE.VideoTexture(video);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.format = THREE.RGBFormat;

    videoMaterial = new THREE.MeshBasicMaterial({ map: videoTexture });

    const aspect = video.videoWidth / video.videoHeight;
    const planeGeometry = new THREE.PlaneGeometry(2 * aspect, 2);
    videoMesh = new THREE.Mesh(planeGeometry, videoMaterial);
    videoMesh.position.z = -1;
    scene.add(videoMesh);

    // カメラの視野角を調整
    camera.fov = 2 * Math.atan(1 / camera.position.z) * (180 / Math.PI);
    camera.updateProjectionMatrix();

    console.log('Video setup complete');
  } catch (error) {
    console.error('カメラの取得に失敗しました:', error);
  }
}

setupVideo();

// OBJファイルのパス
const objFilePath = './models/143.obj';

// フォントローダーを作成
const fontLoader = new FontLoader();

// オブジェクトの中心座標を格納する変数
let objectCenter = new THREE.Vector3();

// オブジェクトを格納するグループを作成
let objGroup = new THREE.Group();
scene.add(objGroup);

// フォントを読み込む
fontLoader.load(
  '/fonts/helvetiker_regular.typeface.json',
  function (font) {
    // ファイル名を取得
    const fileName = objFilePath.split('/').pop();

    // OBJローダーを作成
    const loader = new OBJLoader();

    // OBJファイルを読み込む
    loader.load(
      objFilePath,
      function (object) {
        // 読み込み完了時の処理

        // オブジェクトのバウンディングボックスを計算
        const box = new THREE.Box3().setFromObject(object);
        const size = box.getSize(new THREE.Vector3());
        const objectCenter = box.getCenter(new THREE.Vector3());

        // オブジェクトの位置を調整してセンタリング
        object.position.sub(objectCenter);

        // オブジェクトのマテリアルをワイヤーフレームに変更
        object.traverse(function (child) {
          if (child instanceof THREE.Mesh) {
            child.material = new THREE.MeshBasicMaterial({
              color: 0xffffff,  // 白色
              wireframe: true,  // ワイヤーフレーム表示を有効化
              wireframeLinewidth: 1
            });
          }
        });

        // オブジェクトをグループに追加
        objGroup.add(object);

        // オブジェクトのスケールを調整
        const scale = 0.5 / Math.max(size.x, size.y, size.z);
        objGroup.scale.set(scale, scale, scale);

        // オブジェクトの位置を調整
        objGroup.position.z = 0.5;

        console.log('3D object loaded and set to wireframe');

        // 線を描画
        const lineGeometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(-0.35, 0.45, -0.5)
        ]);
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
        const line = new THREE.Line(lineGeometry, lineMaterial);
        scene.add(line);  // 線を直接シーンに追加

        // テキストジオメトリを作成
        const textGeometry = new TextGeometry(fileName, {
          font: font,
          size: 0.05,
          depth: 0.01,  // .heightの代わりに.depthを使用
          curveSegments: 12,
          bevelEnabled: false
        });

        // テキストマテリアルを作成
        const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

        // テキストメッシュを作成
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);

        // テキストの位置を設定
        textMesh.position.set(-0.45, 0.45, -0.5);

        // テキストをシーンに追加
        scene.add(textMesh);

        console.log('Line and text added to scene');
      },
      function (xhr) {
        // 読み込み進捗時の処理
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      },
      function (error) {
        // エラー時の処理
        console.error('An error happened', error);
      }
    );
  }
);

// 毎フレーム時に実行されるループイベントです
function tick() {
  // グループを回転
  if (objGroup) {
    objGroup.rotation.x += 0.01;
    objGroup.rotation.y += 0.01;
  }

  // ビデオテクスチャを更新
  if (videoTexture) {
    videoTexture.needsUpdate = true;
  }

  // レンダリング
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}

// 初期化のために実行
tick();

// リサイズ時の処理
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  
  // ビデオ背景のアスペクト比を調整
  if (videoMesh && video) {
    const aspect = video.videoWidth / video.videoHeight;
    videoMesh.scale.set(aspect, 1, 1);
  }
}

// デバッグ情報を表示
function addDebugInfo() {
  const debugInfo = document.createElement('div');
  debugInfo.style.position = 'absolute';
  debugInfo.style.top = '10px';
  debugInfo.style.left = '10px';
  debugInfo.style.color = 'white';
  debugInfo.style.fontFamily = 'monospace';
  debugInfo.style.fontSize = '12px';
  debugInfo.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  debugInfo.style.padding = '5px';
  document.body.appendChild(debugInfo);

  function updateDebugInfo() {
    debugInfo.innerHTML = `
      Video ready: ${video ? 'Yes' : 'No'}<br>
      Video playing: ${video && !video.paused ? 'Yes' : 'No'}<br>
      Video dimensions: ${video ? video.videoWidth + 'x' + video.videoHeight : 'N/A'}<br>
      Texture created: ${videoTexture ? 'Yes' : 'No'}<br>
      Mesh added to scene: ${videoMesh ? 'Yes' : 'No'}<br>
    `;
    requestAnimationFrame(updateDebugInfo);
  }

  updateDebugInfo();
}

addDebugInfo();