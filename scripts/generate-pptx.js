#!/usr/bin/env node

/**
 * generate-pptx.js
 *
 * 目标：基于 output/05-ppt-storyboard/05_ppt_storyboard.md 生成可编辑 .pptx。
 * 默认输出：output/06-ppt-output/tencent-waic-visual-system-v02.pptx
 */

const fs = require('fs');
const path = require('path');

let PptxGenJS;
try {
  PptxGenJS = require('pptxgenjs');
} catch (err) {
  console.error('[ERROR] 缺少依赖 pptxgenjs，请先执行 npm install');
  process.exit(1);
}

const ROOT = path.resolve(__dirname, '..');
const STORYBOARD_PATH = path.join(ROOT, 'output/05-ppt-storyboard/05_ppt_storyboard.md');
const OUTPUT_DIR = path.join(ROOT, 'output/06-ppt-output');
const OUTPUT_NAME = process.argv[2] || 'tencent-waic-visual-system-v02.pptx';
const OUTPUT_FILE = path.join(OUTPUT_DIR, OUTPUT_NAME);

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function parseStoryboard(md) {
  const lines = md.split('\n');
  const slides = [];
  let current = null;
  let inCore = false;

  for (const line of lines) {
    const m = line.match(/^##\s+Slide\s+(\d+)｜(.+)$/);
    if (m) {
      if (current) slides.push(current);
      current = { no: Number(m[1]), title: m[2].trim(), bullets: [] };
      inCore = false;
      continue;
    }

    if (!current) continue;

    if (line.trim().startsWith('- **核心内容')) {
      inCore = true;
      continue;
    }

    if (inCore) {
      const b = line.match(/^\s*\d+\)\s+(.+)$/);
      if (b) {
        current.bullets.push(b[1].trim());
        continue;
      }
      if (!line.trim()) inCore = false;
    }
  }

  if (current) slides.push(current);
  return slides;
}

function addCommonPageFrame(pptx, slide, s, total) {
  // 页顶浅色分隔
  slide.addShape(pptx.ShapeType.line, {
    x: 0.6,
    y: 0.95,
    w: 12.1,
    h: 0,
    line: { color: 'DCE3EF', pt: 1 },
  });

  // 页脚与页码
  slide.addText('Tencent WAIC Visual System', {
    x: 0.6,
    y: 6.95,
    w: 5.8,
    h: 0.3,
    fontSize: 10,
    color: '7A7A7A',
    fontFace: 'Arial',
    align: 'left',
  });

  slide.addText(`${s.no}/${total}`, {
    x: 11.7,
    y: 6.95,
    w: 1.0,
    h: 0.3,
    fontSize: 10,
    color: '7A7A7A',
    fontFace: 'Arial',
    align: 'right',
  });
}

function buildPpt(slides) {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE'; // 16:9
  pptx.author = '000-EI-workflow';
  pptx.subject = 'Storyboard to Editable PPTX';
  pptx.title = 'Tencent WAIC Visual System v02';
  pptx.company = 'Tencent';

  const total = slides.length;
  for (const s of slides) {
    const slide = pptx.addSlide();

    slide.background = { color: 'FFFFFF' };

    // 标题文本框（可编辑）
    slide.addText(`Slide ${String(s.no).padStart(2, '0')}｜${s.title}`, {
      x: 0.6,
      y: 0.35,
      w: 12.1,
      h: 0.5,
      bold: true,
      fontSize: 22,
      color: '0052D9',
      fontFace: 'Arial',
    });

    // 正文文本框（可编辑）
    const bullets = s.bullets.length ? s.bullets : ['（待补充核心内容）'];
    slide.addText(
      bullets.map((t) => ({ text: t, options: { bullet: { indent: 18 } } })),
      {
        x: 0.8,
        y: 1.3,
        w: 6.4,
        h: 5.3,
        fontSize: 15,
        color: '1F1F1F',
        fontFace: 'Arial',
        valign: 'top',
      }
    );

    // 图示占位框（可编辑形状）
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 7.45,
      y: 1.3,
      w: 5.25,
      h: 5.3,
      rectRadius: 0.04,
      line: { color: 'B8C4D9', pt: 1.2 },
      fill: { color: 'F7F9FC' },
    });

    slide.addText('图示/图片占位（待补图示）', {
      x: 7.8,
      y: 3.7,
      w: 4.55,
      h: 0.5,
      align: 'center',
      fontSize: 12,
      color: '6E7785',
      fontFace: 'Arial',
    });

    addCommonPageFrame(pptx, slide, s, total);

    // 备注（speaker notes）
    slide.addNotes(`\n[Notes]\n- 本页结论：${s.title}\n- 讲述顺序：先结论，再证据，再行动项。\n- 如有数据，请补充来源与口径。\n`);
  }

  return pptx;
}

async function main() {
  if (!fs.existsSync(STORYBOARD_PATH)) {
    console.error(`[ERROR] 找不到 storyboard: ${STORYBOARD_PATH}`);
    process.exit(1);
  }

  ensureDir(OUTPUT_DIR);
  const md = fs.readFileSync(STORYBOARD_PATH, 'utf-8');
  const slides = parseStoryboard(md);

  if (!slides.length) {
    console.error('[ERROR] 未解析到 Slide 结构，请检查 storyboard 标题格式。');
    process.exit(1);
  }

  const missingCore = slides.filter((s) => s.bullets.length === 0).map((s) => s.no);
  const pptx = buildPpt(slides);
  await pptx.writeFile({ fileName: OUTPUT_FILE });

  const logPath = path.join(OUTPUT_DIR, 'pptx-build-log.md');
  const log = [
    '# PPTX Build Log',
    '',
    `- Date: ${new Date().toISOString()}`,
    `- Source: ${path.relative(ROOT, STORYBOARD_PATH)}`,
    `- Output: ${path.relative(ROOT, OUTPUT_FILE)}`,
    `- Slides: ${slides.length}`,
    '- Layout: 16:9 (LAYOUT_WIDE)',
    '- Editable Objects: title text box / content text box / shape placeholder / page number / speaker notes',
    `- Missing core-content slides: ${missingCore.length ? missingCore.join(', ') : 'none'}`,
    '',
  ].join('\n');
  fs.writeFileSync(logPath, log, 'utf-8');

  console.log(`[DONE] generated: ${OUTPUT_FILE}`);
}

main().catch((err) => {
  console.error('[ERROR] PPTX 生成失败:', err.message);
  process.exit(1);
});
