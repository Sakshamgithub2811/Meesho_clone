import fs from 'fs';

async function inspectRawItems() {
  const beautyRes = await fetch('https://raw.githubusercontent.com/sauravsamui/meesho-clone/master/Productscript/beautyandhealth.js');
  const beautyText = await beautyRes.text();
  const blocks = beautyText.split(/\{\s*image_url\s*:/);
  console.log('--- ALL BEAUTY & HEALTH ITEMS IN SAURAV (Total ' + (blocks.length - 1) + ') ---');
  for (let i = 1; i < blocks.length; i++) {
    const b = blocks[i];
    const imgMatch = b.match(/["']\s*(https:\/\/[^"'\s]+)\s*["']/);
    const nameMatch = b.match(/name\s*:\s*["']([^"']+)["']/);
    if (imgMatch && nameMatch) {
      console.log(`${i}. "${nameMatch[1]}" -> ${imgMatch[1]}`);
    }
  }

  const footRes = await fetch('https://raw.githubusercontent.com/sauravsamui/meesho-clone/master/Productscript/bagFootware.js');
  const footText = await footRes.text();
  const footBlocks = footText.split(/\{\s*image_url\s*:/);
  console.log('\n--- ALL FOOTWEAR ITEMS IN SAURAV (Total ' + (footBlocks.length - 1) + ') ---');
  for (let i = 1; i < footBlocks.length; i++) {
    const b = footBlocks[i];
    const imgMatch = b.match(/["']\s*(https:\/\/[^"'\s]+)\s*["']/);
    const nameMatch = b.match(/name\s*:\s*["']([^"']+)["']/);
    if (imgMatch && nameMatch) {
      console.log(`${i}. "${nameMatch[1]}" -> ${imgMatch[1]}`);
    }
  }

  const electRes = await fetch('https://raw.githubusercontent.com/sauravsamui/meesho-clone/master/Productscript/electronics.js');
  const electText = await electRes.text();
  const electBlocks = electText.split(/\{\s*image_url\s*:/);
  console.log('\n--- ALL ELECTRONICS ITEMS IN SAURAV (Total ' + (electBlocks.length - 1) + ') ---');
  for (let i = 1; i < electBlocks.length; i++) {
    const b = electBlocks[i];
    const imgMatch = b.match(/["']\s*(https:\/\/[^"'\s]+)\s*["']/);
    const nameMatch = b.match(/name\s*:\s*["']([^"']+)["']/);
    if (imgMatch && nameMatch) {
      console.log(`${i}. "${nameMatch[1]}" -> ${imgMatch[1]}`);
    }
  }
}

inspectRawItems();

