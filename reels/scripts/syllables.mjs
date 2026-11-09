// Считает слоги (гласные a e i o u o') в строках узбекской латиницы.
// Запуск: node scripts/syllables.mjs "строка 1" "строка 2" ...  или  node scripts/syllables.mjs < poem.txt
import { readFileSync } from "node:fs";

const count = (s) => (s.toLowerCase().match(/[aeiou]/g) || []).length;

let lines = process.argv.slice(2);
if (lines.length === 0) lines = readFileSync(0, "utf8").split("\n");
lines = lines.map((l) => l.trim()).filter(Boolean);

const nums = lines.map(count);
lines.forEach((l, i) => console.log(String(nums[i]).padStart(2), l));
if (nums.length) {
  console.log(`min ${Math.min(...nums)}, max ${Math.max(...nums)}, разброс ${Math.max(...nums) - Math.min(...nums)}`);
}
