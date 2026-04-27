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
function getPptxGenJS() {
  if (PptxGenJS) return PptxGenJS;
  try {
    PptxGenJS = require('pptxgenjs');
    return PptxGenJS;
  } catch (err) {
    throw new Error('缺少依赖 pptxgenjs，请先执行 npm install');
  }
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

  const stripMd = (text = '') =>
    text
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/\s+/g, ' ')
      .trim();

  const splitKeyValue = (line) => {
    const m = line.match(/^-+\s*\*\*(.+?)\*\*\s*[：:]\s*(.*)$/);
    if (!m) return null;
    return { key: stripMd(m[1]), value: stripMd(m[2] || '') };
  };

  const asPoints = (text) =>
    stripMd(text)
      .split(/[；;。]/)
      .map((x) => x.trim())
      .filter(Boolean);

  const parseSlideBody = (bodyLines) => {
    const fields = {};
    const freeform = [];
    const corePoints = [];
    let inCore = false;

    for (const raw of bodyLines) {
      const line = raw.trim();
      if (!line || /^---+$/.test(line)) continue;

      const kv = splitKeyValue(line);
      if (kv) {
        fields[kv.key] = kv.value;
        inCore = kv.key.startsWith('核心内容');
        if (inCore && kv.value) corePoints.push(...asPoints(kv.value));
        continue;
      }

      if (inCore) {
        const item = line.match(/^(?:[-*]|\d+[.)、])\s+(.+)$/);
        if (item) {
          corePoints.push(stripMd(item[1]));
          continue;
        }
      }

      // 非标准字段时，仍沉淀为 fallback 文本
      freeform.push(stripMd(line.replace(/^(?:[-*]|\d+[.)、])\s+/, '')));
    }

    const getField = (keys) => {
      const hit = Object.keys(fields).find((k) => keys.some((kw) => k.includes(kw)));
      return hit ? fields[hit] : '';
    };

    const fallbackPoints = freeform.filter(Boolean);
    const normalizedPoints = (corePoints.length ? corePoints : fallbackPoints).filter(Boolean);
    const contentPoints = normalizedPoints.slice(0, 5);
    const overflowPoints = normalizedPoints.slice(5);

    return {
      fields,
      contentPoints,
      overflowPoints,
      freeform,
      pageGoal: getField(['页面目标']),
      layoutAdvice: getField(['建议版式']),
      imageAdvice: getField(['建议图示', '图片类型']),
      visualRules: getField(['需要使用的视觉系统规则']),
      evidence: getField(['该页对应的输入依据']),
      designNotes: getField(['设计注意事项']),
      manualFlag: getField(['是否需要人工设计师补充']),
    };
  };

  const buildSlidesFromHeadingMatches = (headingMatches) => {
    const blocks = headingMatches.map((match, idx) => {
      const start = match.lineIndex + 1;
      const end = idx + 1 < headingMatches.length ? headingMatches[idx + 1].lineIndex : lines.length;
      const body = lines.slice(start, end);
      return { ...match.parsed, body };
    });

    return blocks
      .map((b, idx) => {
        const parsedBody = parseSlideBody(b.body);
        const fallbackTitle = b.title || b.section || b.headingRaw || `第 ${idx + 1} 页`;
        return {
          no: Number.isFinite(b.no) && b.no > 0 ? b.no : idx + 1,
          section: b.section || '',
          title: b.title || fallbackTitle,
          headingRaw: b.headingRaw,
          ...parsedBody,
        };
      })
      .filter((s) => s.title);
  };

  // 主路径：标准 Slide 标题解析（支持 ## / ###）
  const headingMatches = [];
  for (let i = 0; i < lines.length; i++) {
    const parsed = parseSlideHeading(lines[i]);
    if (parsed) headingMatches.push({ lineIndex: i, parsed });
  }
  if (headingMatches.length) {
    const slides = buildSlidesFromHeadingMatches(headingMatches);
    return { slides, mode: 'standard', debugHeadings: headingLines.slice(0, 20) };
  }

  // fallback 1: 按 ## 标题拆分
  const h2Matches = [];
  for (let i = 0; i < lines.length; i++) {
    if (/^##\s+/.test(lines[i])) {
      const title = normalize(lines[i].replace(/^##\s+/, ''));
      h2Matches.push({
        lineIndex: i,
        parsed: { no: h2Matches.length + 1, section: '', title, headingRaw: title },
      });
    }
  }
  const h2Slides = buildSlidesFromHeadingMatches(h2Matches);
  if (h2Slides.length >= 1) {
    return { slides: h2Slides, mode: 'fallback-h2', debugHeadings: headingLines.slice(0, 20) };
  }

  // fallback 2: 按 ### 标题拆分
  const h3Matches = [];
  for (let i = 0; i < lines.length; i++) {
    if (/^###\s+/.test(lines[i])) {
      const title = normalize(lines[i].replace(/^###\s+/, ''));
      h3Matches.push({
        lineIndex: i,
        parsed: { no: h3Matches.length + 1, section: '', title, headingRaw: title },
      });
    }
  }
  const h3Slides = buildSlidesFromHeadingMatches(h3Matches);
  if (h3Slides.length >= 1) {
    return { slides: h3Slides, mode: 'fallback-h3', debugHeadings: headingLines.slice(0, 20) };
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
  const Pptx = getPptxGenJS();
  const pptx = new Pptx();
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
    const mainTitle = s.section || s.title || `第 ${s.no} 页`;
    const subtitle = s.section ? s.title : '';
    slide.addText(`Slide ${String(s.no).padStart(2, '0')}｜${mainTitle}`, {
      x: 0.6,
      y: 0.28,
      w: 12.1,
      h: 0.42,
      bold: true,
      fontSize: 20,
      color: '0052D9',
      fontFace: 'Arial',
    });
    if (subtitle) {
      slide.addText(subtitle, {
        x: 0.6,
        y: 0.7,
        w: 12.1,
        h: 0.28,
        fontSize: 13,
        color: '2F5FAF',
        fontFace: 'Arial',
      });
    }

    // 正文文本框（可编辑）
    const points = s.contentPoints && s.contentPoints.length ? s.contentPoints.slice(0, 5) : ['（待补充核心内容）'];
    const needsManual = !s.contentPoints || s.contentPoints.length === 0 || /^(是|yes)/i.test(s.manualFlag || '');
    slide.addText(
      points.map((t) => ({ text: t, options: { bullet: { indent: 16 } } })),
      {
        x: 0.8,
        y: 1.3,
        w: 6.4,
        h: 5.1,
        fontSize: 14,
        color: '1F1F1F',
        fontFace: 'Arial',
        valign: 'top',
      }
    );

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 7.45,
      y: 1.3,
      w: 5.25,
      h: 5.3,
      rectRadius: 0.04,
      line: { color: 'B8C4D9', pt: 1.2 },
      fill: { color: 'F7F9FC' },
    });

    slide.addText(`图示/图片占位：${s.imageAdvice || '需人工补充'}`, {
      x: 7.8,
      y: 3.5,
      w: 4.55,
      h: 0.9,
      align: 'center',
      fontSize: 11,
      color: '6E7785',
      fontFace: 'Arial',
      valign: 'mid',
    });

    addCommonPageFrame(pptx, slide, s, total);

    const evidenceText = s.evidence || '依据来源：需人工补充';
    slide.addText(`依据来源：${evidenceText}`, {
      x: 0.6,
      y: 6.58,
      w: 10.9,
      h: 0.25,
      fontSize: 9,
      color: '6E7785',
      fontFace: 'Arial',
      align: 'left',
    });

    // 备注（speaker notes）
    const noteOverflow = (s.overflowPoints || []).map((x) => `- 扩展要点：${x}`).join('\n');
    const noteFreeform = (s.freeform || [])
      .slice(0, 6)
      .map((x) => `- 备用文本：${x}`)
      .join('\n');
    slide.addNotes(
      `\n[Notes]\n- 页面目标：${s.pageGoal || '需人工补充'}\n- 建议版式：${s.layoutAdvice || '需人工补充'}\n- 建议图示：${
        s.imageAdvice || '需人工补充'
      }\n- 设计注意事项：${s.designNotes || '需人工补充'}\n- 视觉系统规则：${s.visualRules || '需人工补充'}\n- 人工补充项：${
        needsManual ? s.manualFlag || '需人工补充' : s.manualFlag || '否'
      }\n${noteOverflow ? `${noteOverflow}\n` : ''}${noteFreeform ? `${noteFreeform}\n` : ''}`
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

  const missingCore = slides.filter((s) => !s.contentPoints || s.contentPoints.length === 0).map((s) => s.no);
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
