import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [
  { name: "icon-192x192.png", size: 192 },
  { name: "icon-512x512.png", size: 512 },
  { name: "icon-192x192-maskable.png", size: 192 },
  { name: "icon-512x512-maskable.png", size: 512 },
];

async function generateIcons() {
  for (const { name, size } of sizes) {
    try {
      const svgFile = size === 192 ? "icon-192x192.svg" : "icon-512x512.svg";

      await sharp(path.join(__dirname, "public", svgFile))
        .resize(size, size, { fit: "contain", background: { r: 239, g: 68, b: 68, alpha: 1 } })
        .png()
        .toFile(path.join(__dirname, "public", name));

      console.log(`✅ Generated ${name}`);
    } catch (err) {
      console.error(`❌ Error generating ${name}:`, err.message);
    }
  }
}

generateIcons();
