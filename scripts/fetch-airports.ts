
import fs from 'fs';
import path from 'path';

async function run() {
  const url = 'https://raw.githubusercontent.com/mwgg/Airports/master/airports.json';
  console.log('Fetching...');
  const res = await fetch(url);
  if (!res.ok) throw new Error(res.statusText);
  const json = await res.json();
  const destDir = path.resolve(process.cwd(), 'src/lib/data');
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  
  const dest = path.resolve(destDir, 'airports.json');
  fs.writeFileSync(dest, JSON.stringify(json));
  console.log(`Saved to ${dest}, size: ${json ? Object.keys(json).length : 0} airports`);
}
run();
