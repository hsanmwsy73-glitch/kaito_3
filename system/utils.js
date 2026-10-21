import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import axios from "axios";
import FormData from 'form-data';
import { fileTypeFromBuffer } from "file-type";
import { Sticker } from "wa-sticker-formatter";
import cheerio from "cheerio";

const execAsync = promisify(exec);
const tmp = path.join(process.cwd(), "tmp");

if (!fs.existsSync(tmp)) fs.mkdirSync(tmp, { recursive: true });

/* ========== Create Sticker ======== */

const createSticker = async (buffer, options = {}) => {
  const sticker = new Sticker(buffer, {
    pack: options.pack || '𝑲𝑨𝑰𝑻𝑶 𝑩𝑶𝑻',
    author: options.author || '𝑲𝑨𝑰𝑻𝑶',
    type: "full",
    quality: options.mime === "image/jpg" ? 100 : 10
  });
  return sticker.build();
};

/* ========== GIF TO MP4 ========= */

async function gifToMp4(url) {
  const id = Date.now();
  const gifPath = path.join(tmp, `${id}.gif`);
  const mp4Path = path.join(tmp, `${id}.mp4`);
  
  const writer = fs.createWriteStream(gifPath);
  const res = await axios({ url, responseType: 'stream' });
  res.data.pipe(writer);
  await new Promise(r => writer.on('finish', r));
  
  await execAsync(`ffmpeg -i "${gifPath}" -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" -c:v libx264 -pix_fmt yuv420p "${mp4Path}"`);
  
  const buffer = fs.readFileSync(mp4Path);
  fs.unlinkSync(gifPath);
  fs.unlinkSync(mp4Path);
  
  return buffer;
}

/* =========== CatBox =========== */

async function uploadToCatbox(buffer) {
  let file;
  let filename;
  let contentType;

  if (Buffer.isBuffer(buffer)) {
    if (buffer.length === 0) throw new Error('Cannot upload an empty file');

    const type = await fileTypeFromBuffer(buffer);
    filename = `upload-${Date.now()}.${type?.ext || 'bin'}`;
    contentType = type?.mime || 'application/octet-stream';
    file = buffer;
  } else if (typeof buffer === 'string') {
    const filePath = path.resolve(buffer);
    const stats = await fs.promises.stat(filePath).catch(() => null);

    if (!stats?.isFile()) throw new Error(`File not found: ${buffer}`);
    if (stats.size === 0) throw new Error('Cannot upload an empty file');

    filename = path.basename(filePath);
    file = fs.createReadStream(filePath);
  } else {
    throw new TypeError('Catbox upload expects a Buffer or a file path');
  }

  const form = new FormData();
  form.append('reqtype', 'fileupload');
  form.append('fileToUpload', file, {
    filename,
    ...(contentType ? { contentType } : {})
  });

  const { data } = await axios.post('https://catbox.moe/user/api.php', form, {
    headers: form.getHeaders(),
    timeout: 60000,
    maxBodyLength: Infinity,
    responseType: 'text'
  });

  const result = typeof data === 'string' ? data.trim() : '';
  try {
    const url = new URL(result);
    if (url.protocol === 'https:' && url.hostname === 'files.catbox.moe') return result;
  } catch {}

  throw new Error(`Catbox upload failed: ${result || 'empty response'}`);
}

/* =========== AI =========== */

async function AiChat(options = {}) {
  const url = `https://text.pollinations.ai/${options.text}?model=${options.model || "openai"}`;
  return (await fetch(url)).text();
}

/* =========== Qu.ax Upload =========== */

const extractFromHtml = (html, baseUrl) => {
  const $ = cheerio.load(html);
  const selectors = [
    'meta[property="og:image"]', 'meta[property="og:video"]', 'meta[property="og:audio"]',
    'meta[name="twitter:image"]', 'meta[name="twitter:player"]', 'meta[name="twitter:video"]',
    'link[rel="image_src"]', 'link[rel="video_src"]', 'video source', 'audio source', 'img'
  ];
  
  for (const selector of selectors) {
    let url = $(selector).attr('content') || $(selector).attr('src') || $(selector).attr('href');
    if (url && !url.includes('base64') && !url.startsWith('data:')) {
      if (!url.startsWith('http')) {
        try { url = new URL(url, baseUrl).href; } catch(e) { continue; }
      }
      if (url.match(/\.(jpg|jpeg|png|gif|webp|mp4|mkv|webm|mov|mp3|wav|ogg|m4a|flac)(\?|$)/i)) return url;
    }
  }
  return null;
};

const uploadToQuax = async (buffer) => {
  const { ext, mime } = await fileTypeFromBuffer(buffer);
  const form = new FormData();
  form.append('files[]', buffer, { filename: `tmp.${ext}`, contentType: mime });
  const { data } = await axios.post('https://qu.ax/upload.php', form, { headers: form.getHeaders() });
  
  let mediaUrl = typeof data === 'string' ? extractFromHtml(data, 'https://qu.ax') : data.files?.[0]?.url;
  if (!mediaUrl) throw new Error('Upload failed');
  if (mediaUrl.includes('/x/')) return mediaUrl;
  
  const { data: pageHtml } = await axios.get(mediaUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  return extractFromHtml(pageHtml, mediaUrl) || mediaUrl;
};


/* =========== Termai.cc Upload =========== */

async function uploadTmpfiles(buffer) {
    const { ext, mime } = await fileTypeFromBuffer(buffer);
    const form = new FormData();
    form.append('file', buffer, { filename: `file.${ext}`, contentType: mime });

    const res = await axios.post("https://c.termai.cc/api/upload?key=AIzaBj7z2z3xBjsk", form, {
        headers: form.getHeaders(),
        timeout: 30000
    });

    if (!res.data?.status || !res.data?.path) throw new Error("Upload failed: " + JSON.stringify(res.data));
    return res.data.path;
}

export { 
  uploadToCatbox, 
  uploadToQuax, 
  uploadTmpfiles, 
  createSticker, 
  AiChat, 
  gifToMp4
 };