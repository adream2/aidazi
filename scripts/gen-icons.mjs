/**
 * gen-icons.mjs — 从 public/favicon.svg 生成全套站点图标
 *
 * 产出（都在 public/）：
 *   favicon.ico            16/32/48 多尺寸（ICO 容器 + PNG 负载）
 *   apple-touch-icon.png   180×180（iOS 主屏）
 *   icon-192.png           192×192（PWA）
 *   icon-512.png           512×512（PWA）
 *
 * 用法：node scripts/gen-icons.mjs   （需要临时装 sharp：npm i -D sharp）
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');
const SVG = path.join(PUBLIC, 'favicon.svg');

/** 把若干 PNG buffer 打包成 ICO（Vista+ 支持 PNG 负载） */
function buildIco(entries) {
  const count = entries.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);   // reserved
  header.writeUInt16LE(1, 2);   // type: 1 = icon
  header.writeUInt16LE(count, 4);

  const dirSize = 16 * count;
  let offset = 6 + dirSize;
  const dirs = [];
  const blobs = [];

  for (const { size, png } of entries) {
    const d = Buffer.alloc(16);
    d.writeUInt8(size >= 256 ? 0 : size, 0);  // width（0 表示 256）
    d.writeUInt8(size >= 256 ? 0 : size, 1);  // height
    d.writeUInt8(0, 2);                       // palette
    d.writeUInt8(0, 3);                       // reserved
    d.writeUInt16LE(1, 4);                    // planes
    d.writeUInt16LE(32, 6);                   // bit depth
    d.writeUInt32LE(png.length, 8);           // bytes in resource
    d.writeUInt32LE(offset, 12);              // offset
    dirs.push(d);
    blobs.push(png);
    offset += png.length;
  }
  return Buffer.concat([header, ...dirs, ...blobs]);
}

const svg = fs.readFileSync(SVG);

async function png(size, { pad = 0, background = null } = {}) {
  let img = sharp(svg, { density: 384 }).resize(size, size, {
    fit: 'contain',
    background: { r: 0, g: 0, b: 0, alpha: 0 }
  });
  if (pad > 0) {
    const inner = Math.round(size * (1 - pad * 2));
    const scaled = await sharp(svg, { density: 384 })
      .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png().toBuffer();
    img = sharp({
      create: { width: size, height: size, channels: 4, background: background || { r: 0, g: 0, b: 0, alpha: 0 } }
    }).composite([{ input: scaled, gravity: 'center' }]);
  }
  return img.png().toBuffer();
}

// 1. ICO：16 / 32 / 48
const icoSizes = [16, 32, 48];
const icoEntries = [];
for (const s of icoSizes) icoEntries.push({ size: s, png: await png(s) });
fs.writeFileSync(path.join(PUBLIC, 'favicon.ico'), buildIco(icoEntries));
console.log('favicon.ico            ', icoSizes.join('/'), '→',
  (fs.statSync(path.join(PUBLIC, 'favicon.ico')).size / 1024).toFixed(1) + 'KB');

// 2. apple-touch-icon：180，留 8% 安全边距并铺白底（iOS 不支持透明）
fs.writeFileSync(path.join(PUBLIC, 'apple-touch-icon.png'),
  await png(180, { pad: 0.06, background: { r: 250, g: 249, b: 247, alpha: 1 } }));
console.log('apple-touch-icon.png    180 →',
  (fs.statSync(path.join(PUBLIC, 'apple-touch-icon.png')).size / 1024).toFixed(1) + 'KB');

// 3. PWA 图标（maskable 留安全区，避免被系统裁角）
for (const s of [192, 512]) {
  fs.writeFileSync(path.join(PUBLIC, `icon-${s}.png`),
    await png(s, { pad: 0.08, background: { r: 250, g: 249, b: 247, alpha: 1 } }));
  console.log(`icon-${s}.png`.padEnd(23), s, '→',
    (fs.statSync(path.join(PUBLIC, `icon-${s}.png`)).size / 1024).toFixed(1) + 'KB');
}
