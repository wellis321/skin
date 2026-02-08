#!/usr/bin/env node
/**
 * Quick check that @tensorflow/tfjs-node loads and face-api models are found.
 * Run: node scripts/check-tensorflow.mjs
 * If this fails, face detection in analysis will fall back to the fast path.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const root = path.join(__dirname, '..');
const modelPath = path.join(root, 'node_modules/@vladmandic/face-api/model');

console.log('Checking TensorFlow + face-api for skin analysis...\n');

try {
  console.log('1. Loading @tensorflow/tfjs-node...');
  const tf = await import('@tensorflow/tfjs-node');
  await tf.default.setBackend('tensorflow');
  await tf.default.ready();
  console.log('   OK — backend:', tf.default.getBackend());
} catch (e) {
  console.error('   FAILED:', e.message);
  console.error('\n   tfjs-node has native bindings. If you see a load/compile error:');
  console.error('   - Reinstall: npm rebuild @tensorflow/tfjs-node');
  console.error('   - On Apple Silicon: ensure you have Node built for your arch (node -p process.arch)');
  process.exit(1);
}

try {
  console.log('2. Loading @vladmandic/face-api...');
  const faceapi = await import('@vladmandic/face-api');
  console.log('   OK');
  console.log('3. Model path exists?', modelPath);
  const fs = await import('node:fs');
  const exists = fs.existsSync(modelPath);
  console.log('   ', exists ? 'OK' : 'MISSING — models should be in node_modules/@vladmandic/face-api/model');
  if (exists) {
    console.log('4. Loading face detection + landmark models (this can take a few seconds)...');
    await faceapi.default.nets.ssdMobilenetv1.loadFromDisk(modelPath);
    await faceapi.default.nets.faceLandmark68Net.loadFromDisk(modelPath);
    console.log('   OK — face detection is ready.');
  }
} catch (e) {
  console.error('   FAILED:', e.message);
  process.exit(1);
}

console.log('\nAll good. Region-based analysis should run when you upload a face photo.\n');
