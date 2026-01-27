import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let siteContent = null;

export function loadSiteContent() {
  if (!siteContent) {
    const contentPath = path.join(__dirname, 'site-content.json');
    const contentData = fs.readFileSync(contentPath, 'utf8');
    siteContent = JSON.parse(contentData);
  }
  return siteContent;
}

export function getSiteContent() {
  return siteContent || loadSiteContent();
}
