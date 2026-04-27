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
const DIAGRAM_SPEC_DIR = path.join(ROOT, 'output/05b-diagram-spec');
const DIAGRAM_SPEC_FILE = path.join(DIAGRAM_SPEC_DIR, '05b_diagram_specs.json');
const OUTPUT_NAME = process.argv[2] || 'tencent-waic-visual-system-v02.pptx';
const OUTPUT_FILE = path.join(OUTPUT_DIR, OUTPUT_NAME);

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function parseStoryboard(md) {
  const lines = md.split('\n');
  const headingLines = lines.filter((line) => /^#{2,3}\s+/.test(line)).map((line) => line.trimEnd());

  const normalize = (text) => text.replace(/\s+/g, ' ').trim();
  const stripMd = (text = '') =>
    text
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/\s+/g, ' ')
      .trim();

  const parseSlideHeading = (line) => {
    const m = line.match(/^(#{2,3})\s+(.+)$/);
    if (!m) return null;
    const body = normalize(m[2]);

    let parsed = null;
    let mm = body.match(/^Slide\s*0*(\d+)\s*[｜|:：]?\s*(.+)$/i);
    if (mm) parsed = { no: Number(mm[1]), remain: mm[2].trim() };

    if (!parsed) {
      mm = body.match(/^P\s*0*(\d+)\s*[｜|:：]?\s*(.+)$/i);
      if (mm) parsed = { no: Number(mm[1]), remain: mm[2].trim() };
    }

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
    };
  };

  const splitKeyValue = (line) => {
    const m = line.match(/^-+\s*\*\*(.+?)\*\*\s*[：:]\s*(.*)$/);
    if (!m) return null;
    return { key: stripMd(m[1]), value: stripMd(m[2] || '') };
  };

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
        if (inCore && kv.value) {
          kv.value
            .split(/[；;。]/)
            .map((x) => x.trim())
            .filter(Boolean)
            .forEach((x) => corePoints.push(x));
        }
        continue;
      }

      if (inCore) {
        const item = line.match(/^(?:[-*]|\d+[.)、])\s+(.+)$/);
        if (item) {
          corePoints.push(stripMd(item[1]));
          continue;
        }
      }

      freeform.push(stripMd(line.replace(/^(?:[-*]|\d+[.)、])\s+/, '')));
    }

    const getField = (keys) => {
      const hit = Object.keys(fields).find((k) => keys.some((kw) => k.includes(kw)));
      return hit ? fields[hit] : '';
    };

    const normalized = (corePoints.length ? corePoints : freeform).filter(Boolean);
    return {
      contentPoints: normalized.slice(0, 5),
      overflowPoints: normalized.slice(5),
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

  const buildSlidesFromMatches = (matches) =>
    matches
      .map((match, idx) => {
        const start = match.lineIndex + 1;
        const end = idx + 1 < matches.length ? matches[idx + 1].lineIndex : lines.length;
        const parsedBody = parseSlideBody(lines.slice(start, end));
        return {
          no: Number.isFinite(match.parsed.no) && match.parsed.no > 0 ? match.parsed.no : idx + 1,
          section: match.parsed.section || '',
          title: match.parsed.title || match.parsed.section || match.parsed.headingRaw,
          headingRaw: match.parsed.headingRaw,
          ...parsedBody,
        };
      })
      .filter((s) => s.title);

  const headingMatches = [];
  for (let i = 0; i < lines.length; i++) {
    const parsed = parseSlideHeading(lines[i]);
    if (parsed) headingMatches.push({ lineIndex: i, parsed });
  }

  if (headingMatches.length) {
    return { slides: buildSlidesFromMatches(headingMatches), mode: 'standard', debugHeadings: headingLines.slice(0, 20) };
  }

  const h2Matches = [];
  for (let i = 0; i < lines.length; i++) {
    if (/^##\s+/.test(lines[i])) {
      const t = normalize(lines[i].replace(/^##\s+/, ''));
      h2Matches.push({ lineIndex: i, parsed: { no: h2Matches.length + 1, section: '', title: t, headingRaw: t } });
    }
  }
  if (h2Matches.length) {
    return { slides: buildSlidesFromMatches(h2Matches), mode: 'fallback-h2', debugHeadings: headingLines.slice(0, 20) };
  }

  const h3Matches = [];
  for (let i = 0; i < lines.length; i++) {
    if (/^###\s+/.test(lines[i])) {
      const t = normalize(lines[i].replace(/^###\s+/, ''));
      h3Matches.push({ lineIndex: i, parsed: { no: h3Matches.length + 1, section: '', title: t, headingRaw: t } });
    }
  }
  if (h3Matches.length) {
    return { slides: buildSlidesFromMatches(h3Matches), mode: 'fallback-h3', debugHeadings: headingLines.slice(0, 20) };
  }

  return { slides: [], mode: 'none', debugHeadings: headingLines.slice(0, 20) };
}

const DIAGRAM_TYPES = ['process-flow', 'timeline', 'comparison', 'hierarchy', 'matrix', 'relationship-map', 'roadmap', 'card-cluster'];
const DIAGRAM_KEYWORDS = {
  'process-flow': ['流程', '步骤', '顺序', '工作流', '路径'],
  timeline: ['阶段', '时间', '节点', '演进', '时间轴'],
  comparison: ['对比', '差异', '优缺点', 'A/B', '三案', '候选'],
  hierarchy: ['结构', '层级', '一级', '二级', '三级', '体系'],
  matrix: ['矩阵', '象限', '横轴', '纵轴', '维度'],
  'relationship-map': ['关系', '连接', '协同', '触点', '映射', '辐射'],
  roadmap: ['路线图', '路线', '下一步', '里程碑', '推进'],
  'card-cluster': ['模块', '构成', '组成', '总览', '模板'],
};

function inferDiagramSpec(slide) {
  const bag = [slide.title, slide.section, slide.pageGoal, slide.layoutAdvice, slide.imageAdvice, slide.designNotes, ...(slide.contentPoints || [])]
    .filter(Boolean)
    .join(' | ')
    .toLowerCase();

  const score = Object.fromEntries(DIAGRAM_TYPES.map((t) => [t, 0]));
  Object.entries(DIAGRAM_KEYWORDS).forEach(([type, words]) => {
    words.forEach((w) => {
      if (bag.includes(w.toLowerCase())) score[type] += 1;
    });
  });

  if ((slide.layoutAdvice || '').includes('矩阵')) score.matrix += 2;
  if ((slide.layoutAdvice || '').includes('流程')) score['process-flow'] += 2;
  if ((slide.layoutAdvice || '').includes('时间轴')) score.timeline += 2;
  if ((slide.imageAdvice || '').includes('路线图')) score.roadmap += 2;

  let diagramType = 'card-cluster';
  let best = 0;
  Object.entries(score).forEach(([type, v]) => {
    if (v > best) {
      best = v;
      diagramType = type;
    }
  });

  const confidence = Math.min(0.95, 0.35 + best * 0.12);
  const diagramNeeded = best >= 2 || /(图|矩阵|流程|关系|时间轴|路线)/.test(slide.imageAdvice || '');

  const nodes = (slide.contentPoints || []).slice(0, 6).map((x, i) => ({ id: `n${i + 1}`, label: x }));
  const sourceFields = [
    ['页面目标', slide.pageGoal],
    ['核心内容', (slide.contentPoints || []).join('；')],
    ['建议版式', slide.layoutAdvice],
    ['建议图示 / 图片类型', slide.imageAdvice],
    ['设计注意事项', slide.designNotes],
  ]
    .filter(([, v]) => v)
    .map(([k]) => k);

  const data = { nodes, stages: nodes };
  if (diagramType === 'comparison') {
    data.columns = nodes.slice(0, 3).map((n, i) => ({ title: `维度 ${i + 1}`, bullets: [n.label] }));
  } else if (diagramType === 'matrix') {
    data.xAxis = '横轴维度';
    data.yAxis = '纵轴维度';
    data.quadrants = nodes.slice(0, 4).map((n, i) => ({ name: `Q${i + 1}`, text: n.label }));
  } else if (diagramType === 'relationship-map') {
    data.center = slide.section || slide.title || '核心主题';
  } else if (diagramType === 'hierarchy') {
    data.root = slide.section || slide.title || '上层';
    data.children = nodes.slice(0, 4);
  }

  return {
    slideNumber: slide.no,
    slideTitle: `${slide.section ? `${slide.section}：` : ''}${slide.title}`,
    diagramNeeded,
    diagramType,
    confidence: Number(confidence.toFixed(2)),
    sourceFields,
    diagramData: data,
    layoutHint: slide.layoutAdvice || '右侧图示区',
  };
}

function buildDiagramSpecs(slides) {
  return slides.map(inferDiagramSpec);
}

function getShapeType(pptx, key, fallback) {
  return (pptx.ShapeType && pptx.ShapeType[key]) || fallback;
}

function renderDiagram(slide, pptx, spec) {
  const area = { x: 7.45, y: 1.3, w: 5.25, h: 5.3 };
  const theme = { primary: '0052D9', secondary: '2F5FAF', border: 'B8C4D9', text: '1F1F1F', muted: '6E7785', bg: 'F7F9FC' };
  const roundRect = getShapeType(pptx, 'roundRect', 'roundRect');
  const line = getShapeType(pptx, 'line', 'line');
  const ellipse = getShapeType(pptx, 'ellipse', 'ellipse');

  const addNode = (text, box, fill = 'FFFFFF') => {
    slide.addShape(roundRect, {
      x: box.x,
      y: box.y,
      w: box.w,
      h: box.h,
      rectRadius: 0.05,
      line: { color: theme.border, pt: 1 },
      fill: { color: fill },
    });
    slide.addText(text || '待补充', {
      x: box.x + 0.08,
      y: box.y + 0.06,
      w: box.w - 0.16,
      h: box.h - 0.12,
      fontSize: 10,
      color: theme.text,
      align: 'center',
      valign: 'mid',
      fontFace: 'Arial',
    });
  };

  const addArrow = (from, to) => {
    slide.addShape(line, {
      x: from.x,
      y: from.y,
      w: to.x - from.x,
      h: to.y - from.y,
      line: { color: theme.secondary, pt: 1.2, endArrowType: 'triangle' },
    });
  };

  slide.addShape(roundRect, {
    x: area.x,
    y: area.y,
    w: area.w,
    h: area.h,
    rectRadius: 0.04,
    line: { color: theme.border, pt: 1.2 },
    fill: { color: theme.bg },
  });

  const nodes = (spec.diagramData.nodes || []).slice(0, 6);

  switch (spec.diagramType) {
    case 'process-flow': {
      const use = nodes.slice(0, 4);
      const stepW = Math.min(1.15, area.w / Math.max(1, use.length) - 0.2);
      const gap = (area.w - stepW * use.length) / Math.max(1, use.length - 1);
      use.forEach((n, i) => {
        const x = area.x + i * (stepW + gap);
        const y = area.y + area.h / 2 - 0.35;
        addNode(n.label, { x, y, w: stepW, h: 0.7 });
        if (i < use.length - 1) addArrow({ x: x + stepW, y: y + 0.35 }, { x: x + stepW + gap - 0.05, y: y + 0.35 });
      });
      break;
    }
    case 'timeline':
    case 'roadmap': {
      const use = (spec.diagramData.stages || nodes).slice(0, 5);
      const y = area.y + area.h / 2;
      slide.addShape(line, { x: area.x + 0.2, y, w: area.w - 0.4, h: 0, line: { color: theme.secondary, pt: 1.4 } });
      const step = (area.w - 0.4) / Math.max(1, use.length - 1);
      use.forEach((n, i) => {
        const cx = area.x + 0.2 + i * step;
        slide.addShape(ellipse, { x: cx - 0.08, y: y - 0.08, w: 0.16, h: 0.16, fill: { color: theme.primary }, line: { color: theme.primary, pt: 1 } });
        slide.addText(n.label, { x: cx - 0.5, y: y + 0.12 + (spec.diagramType === 'roadmap' && i % 2 ? 0.25 : 0), w: 1, h: 0.6, fontSize: 9, align: 'center', color: theme.text });
      });
      break;
    }
    case 'comparison': {
      const cols = (spec.diagramData.columns || []).slice(0, 3);
      const w = (area.w - 0.2 * (cols.length - 1)) / Math.max(1, cols.length);
      cols.forEach((c, i) => {
        const x = area.x + i * (w + 0.2);
        addNode(c.title, { x, y: area.y, w, h: 0.55 }, 'EAF0FD');
        addNode((c.bullets || []).join('\n'), { x, y: area.y + 0.65, w, h: area.h - 0.65 });
      });
      break;
    }
    case 'hierarchy': {
      const root = spec.diagramData.root || '上层';
      const children = (spec.diagramData.children || nodes).slice(0, 4);
      const rootBox = { x: area.x + area.w / 2 - 0.7, y: area.y, w: 1.4, h: 0.55 };
      addNode(root, rootBox, 'EAF0FD');
      const childW = 1.1;
      const gap = (area.w - childW * children.length) / Math.max(1, children.length - 1);
      children.forEach((child, i) => {
        const x = area.x + i * (childW + gap);
        const y = area.y + 1.25;
        addNode(child.label, { x, y, w: childW, h: 0.65 });
        addArrow({ x: rootBox.x + rootBox.w / 2, y: rootBox.y + rootBox.h }, { x: x + childW / 2, y });
      });
      break;
    }
    case 'matrix': {
      const xMid = area.x + area.w / 2;
      const yMid = area.y + area.h / 2;
      slide.addShape(line, { x: area.x, y: yMid, w: area.w, h: 0, line: { color: theme.secondary, pt: 1 } });
      slide.addShape(line, { x: xMid, y: area.y, w: 0, h: area.h, line: { color: theme.secondary, pt: 1 } });
      slide.addText(spec.diagramData.xAxis || '横轴', { x: area.x + area.w - 0.8, y: yMid + 0.05, w: 0.7, h: 0.3, fontSize: 9, color: theme.muted });
      slide.addText(spec.diagramData.yAxis || '纵轴', { x: xMid + 0.05, y: area.y + 0.05, w: 0.7, h: 0.3, fontSize: 9, color: theme.muted });
      const quads = (spec.diagramData.quadrants || []).slice(0, 4);
      const pos = [
        { x: area.x + 0.1, y: area.y + 0.1 },
        { x: xMid + 0.1, y: area.y + 0.1 },
        { x: area.x + 0.1, y: yMid + 0.1 },
        { x: xMid + 0.1, y: yMid + 0.1 },
      ];
      quads.forEach((q, i) => slide.addText(`${q.name}: ${q.text}`, { x: pos[i].x, y: pos[i].y, w: area.w / 2 - 0.2, h: 0.5, fontSize: 9, color: theme.text }));
      break;
    }
    case 'relationship-map': {
      const center = spec.diagramData.center || '核心';
      const centerBox = { x: area.x + area.w / 2 - 0.75, y: area.y + area.h / 2 - 0.3, w: 1.5, h: 0.6 };
      addNode(center, centerBox, 'EAF0FD');
      const use = nodes.slice(0, 5);
      const radiusX = area.w / 2 - 0.8;
      const radiusY = area.h / 2 - 0.8;
      use.forEach((n, i) => {
        const angle = (Math.PI * 2 * i) / Math.max(1, use.length);
        const x = centerBox.x + 0.75 + radiusX * Math.cos(angle) - 0.55;
        const y = centerBox.y + 0.3 + radiusY * Math.sin(angle) - 0.25;
        addNode(n.label, { x, y, w: 1.1, h: 0.5 });
        addArrow({ x: centerBox.x + 0.75, y: centerBox.y + 0.3 }, { x: x + 0.55, y: y + 0.25 });
      });
      break;
    }
    case 'card-cluster':
    default: {
      const use = nodes.slice(0, 6);
      const cols = 2;
      const cardW = (area.w - 0.2) / cols - 0.1;
      const cardH = 0.75;
      use.forEach((n, i) => {
        const row = Math.floor(i / cols);
        const col = i % cols;
        addNode(n.label, { x: area.x + col * (cardW + 0.2), y: area.y + row * (cardH + 0.2), w: cardW, h: cardH });
      });
      break;
    }
  }
}

function addCommonPageFrame(pptx, slide, s, total) {
  const line = getShapeType(pptx, 'line', 'line');
  slide.addShape(line, {
    x: 0.6,
    y: 0.95,
    w: 12.1,
    h: 0,
    line: { color: 'DCE3EF', pt: 1 },
  });

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

function buildPpt(slides, diagramSpecs) {
  const Pptx = getPptxGenJS();
  const pptx = new Pptx();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = '000-EI-workflow';
  pptx.subject = 'Storyboard to Editable PPTX';
  pptx.title = 'Tencent WAIC Visual System v02';
  pptx.company = 'Tencent';

  const total = slides.length;
  for (const s of slides) {
    const slide = pptx.addSlide();
    const spec = diagramSpecs.find((d) => d.slideNumber === s.no);
    const shouldRenderDiagram = Boolean(spec && spec.diagramNeeded && spec.confidence >= 0.45);

    slide.background = { color: 'FFFFFF' };

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

    if (shouldRenderDiagram) {
      renderDiagram(slide, pptx, spec);
    } else {
      const roundRect = getShapeType(pptx, 'roundRect', 'roundRect');
      slide.addShape(roundRect, {
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
    }

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

    const noteOverflow = (s.overflowPoints || []).map((x) => `- 扩展要点：${x}`).join('\n');
    const noteFreeform = (s.freeform || [])
      .slice(0, 6)
      .map((x) => `- 备用文本：${x}`)
      .join('\n');
    const noteDiagramFallback = !shouldRenderDiagram ? '- 该页图示需人工补充。\n' : '';
    slide.addNotes(
      `\n[Notes]\n- 页面目标：${s.pageGoal || '需人工补充'}\n- 建议版式：${s.layoutAdvice || '需人工补充'}\n- 建议图示：${
        s.imageAdvice || '需人工补充'
      }\n- 设计注意事项：${s.designNotes || '需人工补充'}\n- 视觉系统规则：${s.visualRules || '需人工补充'}\n- 图示识别：${
        spec ? `${spec.diagramType} (confidence=${spec.confidence})` : 'none'
      }\n- 人工补充项：${needsManual ? s.manualFlag || '需人工补充' : s.manualFlag || '否'}\n${noteDiagramFallback}${
        noteOverflow ? `${noteOverflow}\n` : ''
      }${noteFreeform ? `${noteFreeform}\n` : ''}`
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
  ensureDir(DIAGRAM_SPEC_DIR);
  const md = fs.readFileSync(STORYBOARD_PATH, 'utf-8');
  const { slides, mode, debugHeadings } = parseStoryboard(md);

  if (!slides.length) {
    console.error('[ERROR] 未解析到 Slide 结构，请检查 storyboard 标题格式。');
    console.error('[DEBUG] 前 20 个标题行如下：');
    debugHeadings.forEach((line, idx) => console.error(`${String(idx + 1).padStart(2, '0')}. ${line}`));
    process.exit(1);
  }

  const diagramSpecs = buildDiagramSpecs(slides);
  fs.writeFileSync(DIAGRAM_SPEC_FILE, JSON.stringify(diagramSpecs, null, 2), 'utf-8');

  const missingCore = slides.filter((s) => !s.contentPoints || s.contentPoints.length === 0).map((s) => s.no);
  const pptx = buildPpt(slides, diagramSpecs);
  await pptx.writeFile({ fileName: OUTPUT_FILE });

  const logPath = path.join(OUTPUT_DIR, 'pptx-build-log.md');
  const log = [
    '# PPTX Build Log',
    '',
    `- Date: ${new Date().toISOString()}`,
    `- Source: ${path.relative(ROOT, STORYBOARD_PATH)}`,
    `- Diagram Spec: ${path.relative(ROOT, DIAGRAM_SPEC_FILE)}`,
    `- Output: ${path.relative(ROOT, OUTPUT_FILE)}`,
    `- Slides: ${slides.length}`,
    `- Parse Mode: ${mode}`,
    `- Diagram Enabled Slides: ${diagramSpecs.filter((d) => d.diagramNeeded && d.confidence >= 0.45).length}`,
    '- Layout: 16:9 (LAYOUT_WIDE)',
    '- Editable Objects: title text box / content text box / shape-based diagrams / page number / speaker notes',
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
