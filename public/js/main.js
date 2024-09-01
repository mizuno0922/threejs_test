import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

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

// OBJローダーを作成
const loader = new OBJLoader();

let objGroup = new THREE.Group();  // オブジェクトを格納するグループを作成
scene.add(objGroup);  // グループをシーンに追加

// OBJファイルを読み込む
loader.load(
  './models/143.obj', // OBJファイルのパス
  function (object) {
    // 読み込み完了時の処理

    // オブジェクトのバウンディングボックスを計算
    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    // オブジェクトの位置を調整してセンタリング
    object.position.sub(center);

    // オブジェクトをグループに追加
    objGroup.add(object);

    // カメラの位置を調整
    const distance = Math.max(size.x, size.y, size.z) * 2;
    camera.position.set(distance, distance, distance);
    camera.lookAt(objGroup.position);
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

// 毎フレーム時に実行されるループイベントです
function tick() {
  // グループを回転
  objGroup.rotation.x += 0.01;
  objGroup.rotation.y += 0.01;

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
}