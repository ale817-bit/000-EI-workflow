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
  const headingLines = lines
    .filter((line) => /^#{2,3}\s+/.test(line))
    .map((line) => line.replace(/\s+$/, ''));

  const normalize = (text) => text.replace(/\s+/g, ' ').trim();
  const parseSlideHeading = (line) => {
    const m = line.match(/^(#{2,3})\s+(.+)$/);
    if (!m) return null;
    const body = normalize(m[2]);
    let parsed = null;

    // Slide 01｜封面：标题 / Slide 01 | 封面：标题 / Slide 01: 标题 / Slide 01 标题
    let mm = body.match(/^Slide\s*0*(\d+)\s*[｜|:：]?\s*(.+)$/i);
    if (mm) {
      parsed = { no: Number(mm[1]), remain: mm[2].trim() };
    }

    // P01 标题
    if (!parsed) {
      mm = body.match(/^P\s*0*(\d+)\s*[｜|:：]?\s*(.+)$/i);
      if (mm) parsed = { no: Number(mm[1]), remain: mm[2].trim() };
    }

    // 第 1 页：标题
    if (!parsed) {
      mm = body.match(/^第\s*0*(\d+)\s*页\s*[｜|:：]?\s*(.+)$/);
      if (mm) parsed = { no: Number(mm[1]), remain: mm[2].trim() };
    }

    if (!parsed) return null;

    let section = '';
    let title = parsed.remain;
    const split = parsed.remain.match(/^([^：:]+)\s*[：:]\s*(.+)$/);
    if (split) {
      section = split[1].trim();
      title = split[2].trim();
    }

    return {
      no: parsed.no,
      section,
      title,
      headingRaw: body,
      bullets: [],
    };
  };

  const finalizeSlides = (sourceSlides) => {
    // 清理空标题，保证最小可用结构
    return sourceSlides
      .filter((s) => s && (s.title || s.section || s.headingRaw))
      .map((s) => ({
        ...s,
        no: Number.isFinite(s.no) && s.no > 0 ? s.no : sourceSlides.indexOf(s) + 1,
        section: s.section || '',
        title: s.title || s.section || s.headingRaw || `第 ${sourceSlides.indexOf(s) + 1} 页`,
        bullets: Array.isArray(s.bullets) ? s.bullets : [],
      }));
  };

  const collectBullets = (sourceSlides) => {
    let current = null;
    let inCore = false;
    for (const line of lines) {
      const parsed = parseSlideHeading(line);
      if (parsed) {
        current = sourceSlides.find((s) => s.headingRaw === parsed.headingRaw && s.no === parsed.no);
        inCore = false;
        continue;
      }
      if (!current) continue;
      if (line.trim().startsWith('- **核心内容')) {
        inCore = true;
        continue;
      }
      if (inCore) {
        const b = line.match(/^\s*(?:[-*]|\d+[.)、])\s+(.+)$/);
        if (b) {
          current.bullets.push(b[1].trim());
          continue;
        }
        if (!line.trim()) inCore = false;
      }
    }
  };

  // 主路径：标准 Slide 标题解析（支持 ## / ###）
  const parsedSlides = [];
  for (const line of lines) {
    const parsed = parseSlideHeading(line);
    if (parsed) parsedSlides.push(parsed);
  }
  if (parsedSlides.length) {
    const slides = finalizeSlides(parsedSlides);
    collectBullets(slides);
    return { slides, mode: 'standard', debugHeadings: headingLines.slice(0, 20) };
  }

  // fallback 1: 按 ## 标题拆分
  const h2Slides = headingLines
    .filter((line) => /^##\s+/.test(line))
    .map((line, idx) => ({
      no: idx + 1,
      section: '',
      title: normalize(line.replace(/^##\s+/, '')),
      headingRaw: normalize(line.replace(/^##\s+/, '')),
      bullets: [],
    }));
  if (h2Slides.length >= 1) {
    return { slides: finalizeSlides(h2Slides), mode: 'fallback-h2', debugHeadings: headingLines.slice(0, 20) };
  }

  // fallback 2: 按 ### 标题拆分
  const h3Slides = headingLines
    .filter((line) => /^###\s+/.test(line))
    .map((line, idx) => ({
      no: idx + 1,
      section: '',
      title: normalize(line.replace(/^###\s+/, '')),
      headingRaw: normalize(line.replace(/^###\s+/, '')),
      bullets: [],
    }));
  if (h3Slides.length >= 1) {
    return { slides: finalizeSlides(h3Slides), mode: 'fallback-h3', debugHeadings: headingLines.slice(0, 20) };
  }

  return { slides: [], mode: 'none', debugHeadings: headingLines.slice(0, 20) };
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
    const slideTitlePrefix = s.section ? `${s.section}：` : '';
    slide.addText(`Slide ${String(s.no).padStart(2, '0')}｜${slideTitlePrefix}${s.title}`, {
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
    const needsManual = !s.title || s.bullets.length === 0;
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
    slide.addNotes(
      `\n[Notes]\n- 本页结论：${s.title || '需人工补充'}\n- 讲述顺序：先结论，再证据，再行动项。\n- 如有数据，请补充来源与口径。\n${
        needsManual ? '- 需人工补充。\n' : ''
      }`
    );
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
  const { slides, mode, debugHeadings } = parseStoryboard(md);

  if (!slides.length) {
    console.error('[ERROR] 未解析到 Slide 结构，请检查 storyboard 标题格式。');
    console.error('[DEBUG] 前 20 个标题行如下：');
    debugHeadings.forEach((line, idx) => {
      console.error(`${String(idx + 1).padStart(2, '0')}. ${line}`);
    });
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
    `- Parse Mode: ${mode}`,
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
