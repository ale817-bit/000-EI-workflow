const { getDiagramArea, getDiagramTheme } = require('./diagram-layouts');

function addNode(slide, text, box, theme, opts = {}) {
  slide.addShape('roundRect', {
    x: box.x,
    y: box.y,
    w: box.w,
    h: box.h,
    rectRadius: 0.05,
    line: { color: theme.border, pt: 1 },
    fill: { color: opts.fill || 'FFFFFF' },
  });
  slide.addText(text || '待补充', {
    x: box.x + 0.08,
    y: box.y + 0.06,
    w: box.w - 0.16,
    h: box.h - 0.12,
    fontSize: 10,
    color: theme.text,
    valign: 'mid',
    align: 'center',
    fontFace: 'Arial',
  });
}

function addArrow(slide, from, to, theme) {
  slide.addShape('line', {
    x: from.x,
    y: from.y,
    w: to.x - from.x,
    h: to.y - from.y,
    line: { color: theme.secondary, pt: 1.2, endArrowType: 'triangle' },
  });
}

function renderProcessFlow(slide, spec, area, theme) {
  const nodes = (spec.diagramData.nodes || []).slice(0, 4);
  const stepW = Math.min(1.15, area.w / Math.max(nodes.length, 1) - 0.2);
  const gap = (area.w - stepW * nodes.length) / Math.max(1, nodes.length - 1);
  nodes.forEach((node, idx) => {
    const x = area.x + idx * (stepW + gap);
    const y = area.y + area.h / 2 - 0.35;
    addNode(slide, node.label, { x, y, w: stepW, h: 0.7 }, theme);
    if (idx < nodes.length - 1) {
      addArrow(slide, { x: x + stepW, y: y + 0.35 }, { x: x + stepW + gap - 0.05, y: y + 0.35 }, theme);
    }
  });
}

function renderTimeline(slide, spec, area, theme) {
  const nodes = (spec.diagramData.stages || spec.diagramData.nodes || []).slice(0, 5);
  const y = area.y + area.h / 2;
  slide.addShape('line', { x: area.x + 0.2, y, w: area.w - 0.4, h: 0, line: { color: theme.secondary, pt: 1.4 } });
  const step = (area.w - 0.4) / Math.max(nodes.length - 1, 1);
  nodes.forEach((node, idx) => {
    const cx = area.x + 0.2 + idx * step;
    slide.addShape('ellipse', {
      x: cx - 0.08,
      y: y - 0.08,
      w: 0.16,
      h: 0.16,
      fill: { color: theme.primary },
      line: { color: theme.primary, pt: 1 },
    });
    slide.addText(node.label, { x: cx - 0.5, y: y + 0.12, w: 1, h: 0.6, fontSize: 9, align: 'center', color: theme.text });
  });
}

function renderComparison(slide, spec, area, theme) {
  const cols = (spec.diagramData.columns || []).slice(0, 3);
  const w = (area.w - 0.2 * (cols.length - 1)) / Math.max(cols.length, 1);
  cols.forEach((col, idx) => {
    const x = area.x + idx * (w + 0.2);
    addNode(slide, col.title, { x, y: area.y, w, h: 0.55 }, theme, { fill: 'EAF0FD' });
    addNode(slide, (col.bullets || []).join('\n'), { x, y: area.y + 0.65, w, h: area.h - 0.65 }, theme);
  });
}

function renderHierarchy(slide, spec, area, theme) {
  const root = spec.diagramData.root || '上层';
  const children = (spec.diagramData.children || []).slice(0, 4);
  const rootBox = { x: area.x + area.w / 2 - 0.7, y: area.y, w: 1.4, h: 0.55 };
  addNode(slide, root, rootBox, theme, { fill: 'EAF0FD' });
  const childW = 1.1;
  const gap = (area.w - childW * children.length) / Math.max(children.length - 1, 1);
  children.forEach((child, idx) => {
    const x = area.x + idx * (childW + gap);
    const y = area.y + 1.25;
    addNode(slide, child.label, { x, y, w: childW, h: 0.65 }, theme);
    addArrow(slide, { x: rootBox.x + rootBox.w / 2, y: rootBox.y + rootBox.h }, { x: x + childW / 2, y }, theme);
  });
}

function renderMatrix(slide, spec, area, theme) {
  const xMid = area.x + area.w / 2;
  const yMid = area.y + area.h / 2;
  slide.addShape('line', { x: area.x, y: yMid, w: area.w, h: 0, line: { color: theme.secondary, pt: 1 } });
  slide.addShape('line', { x: xMid, y: area.y, w: 0, h: area.h, line: { color: theme.secondary, pt: 1 } });
  slide.addText(spec.diagramData.xAxis || '横轴', { x: area.x + area.w - 0.8, y: yMid + 0.05, w: 0.7, h: 0.3, fontSize: 9, color: theme.muted });
  slide.addText(spec.diagramData.yAxis || '纵轴', { x: xMid + 0.05, y: area.y + 0.05, w: 0.7, h: 0.3, fontSize: 9, color: theme.muted });
  const quads = (spec.diagramData.quadrants || []).slice(0, 4);
  const positions = [
    { x: area.x + 0.1, y: area.y + 0.1 },
    { x: xMid + 0.1, y: area.y + 0.1 },
    { x: area.x + 0.1, y: yMid + 0.1 },
    { x: xMid + 0.1, y: yMid + 0.1 },
  ];
  quads.forEach((q, i) => {
    slide.addText(`${q.name}: ${q.text}`, { x: positions[i].x, y: positions[i].y, w: area.w / 2 - 0.2, h: 0.5, fontSize: 9, color: theme.text });
  });
}

function renderRelationshipMap(slide, spec, area, theme) {
  const center = spec.diagramData.center || '核心';
  const centerBox = { x: area.x + area.w / 2 - 0.75, y: area.y + area.h / 2 - 0.3, w: 1.5, h: 0.6 };
  addNode(slide, center, centerBox, theme, { fill: 'EAF0FD' });
  const nodes = (spec.diagramData.nodes || []).slice(0, 5);
  const radiusX = area.w / 2 - 0.8;
  const radiusY = area.h / 2 - 0.8;
  nodes.forEach((n, idx) => {
    const angle = (Math.PI * 2 * idx) / Math.max(nodes.length, 1);
    const x = centerBox.x + 0.75 + radiusX * Math.cos(angle) - 0.55;
    const y = centerBox.y + 0.3 + radiusY * Math.sin(angle) - 0.25;
    addNode(slide, n.label, { x, y, w: 1.1, h: 0.5 }, theme);
    addArrow(slide, { x: centerBox.x + 0.75, y: centerBox.y + 0.3 }, { x: x + 0.55, y: y + 0.25 }, theme);
  });
}

function renderRoadmap(slide, spec, area, theme) {
  const nodes = (spec.diagramData.stages || spec.diagramData.nodes || []).slice(0, 4);
  const cardW = 1.1;
  const gap = 0.25;
  nodes.forEach((n, idx) => {
    const x = area.x + idx * (cardW + gap);
    const y = area.y + 0.5 + (idx % 2 === 0 ? 0 : 0.45);
    addNode(slide, `阶段${idx + 1}\n${n.label}`, { x, y, w: cardW, h: 0.9 }, theme);
    if (idx < nodes.length - 1) {
      addArrow(slide, { x: x + cardW, y: y + 0.45 }, { x: x + cardW + gap - 0.05, y: y + 0.45 }, theme);
    }
  });
}

function renderCardCluster(slide, spec, area, theme) {
  const nodes = (spec.diagramData.nodes || []).slice(0, 6);
  const cols = 2;
  const cardW = (area.w - 0.2) / cols - 0.1;
  const cardH = 0.75;
  nodes.forEach((n, idx) => {
    const row = Math.floor(idx / cols);
    const col = idx % cols;
    const x = area.x + col * (cardW + 0.2);
    const y = area.y + row * (cardH + 0.2);
    addNode(slide, n.label, { x, y, w: cardW, h: cardH }, theme);
  });
}

function renderDiagram(slide, spec) {
  const area = getDiagramArea();
  const theme = getDiagramTheme();

  slide.addShape('roundRect', {
    x: area.x,
    y: area.y,
    w: area.w,
    h: area.h,
    rectRadius: 0.04,
    line: { color: theme.border, pt: 1.2 },
    fill: { color: theme.bg },
  });

  switch (spec.diagramType) {
    case 'process-flow':
      renderProcessFlow(slide, spec, area, theme);
      break;
    case 'timeline':
      renderTimeline(slide, spec, area, theme);
      break;
    case 'comparison':
      renderComparison(slide, spec, area, theme);
      break;
    case 'hierarchy':
      renderHierarchy(slide, spec, area, theme);
      break;
    case 'matrix':
      renderMatrix(slide, spec, area, theme);
      break;
    case 'relationship-map':
      renderRelationshipMap(slide, spec, area, theme);
      break;
    case 'roadmap':
      renderRoadmap(slide, spec, area, theme);
      break;
    case 'card-cluster':
    default:
      renderCardCluster(slide, spec, area, theme);
      break;
  }

  return { area };
}

module.exports = {
  renderDiagram,
};
