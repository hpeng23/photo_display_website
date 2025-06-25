const fs = require('fs');
const path = require('path');

const photoDir = path.join(__dirname, '../public/photo');
const musicDir = path.join(__dirname, '../public/music');
const output = path.join(__dirname, '../public/assets.json');

function getFiles(dir, exts, base = '') {
  if (!fs.existsSync(dir)) return [];
  let results = [];
  for (const f of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, f);
    const relPath = base ? path.join(base, f) : f;
    if (fs.statSync(fullPath).isDirectory()) {
      results = results.concat(getFiles(fullPath, exts, relPath));
    } else if (exts.includes(path.extname(f).toLowerCase())) {
      results.push(relPath.replace(/\\/g, '/'));
    }
  }
  return results;
}

const photos = getFiles(photoDir, ['.jpg', '.jpeg', '.png', '.gif', '.webp']);
const musics = getFiles(musicDir, ['.mp3', '.ogg', '.wav', '.mgg']);

const data = {
  photos,
  musics
};

fs.writeFileSync(output, JSON.stringify(data, null, 2), 'utf-8');
console.log('资源列表已生成:', output); 