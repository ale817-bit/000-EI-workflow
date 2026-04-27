const DIAGRAM_TYPES = [
  'process-flow',
  'timeline',
  'comparison',
  'hierarchy',
  'matrix',
  'relationship-map',
  'roadmap',
  'card-cluster',
];

const KEYWORDS = {
  'process-flow': ['流程', '步骤', '顺序', '工作流', '路径', '流程图', '闭环'],
  timeline: ['阶段', '时间', '节点', '演进', '时间线', '里程碑'],
  comparison: ['对比', '差异', '优缺点', 'a/b', '三案', '候选', '推荐'],
  hierarchy: ['层级', '一级', '二级', '三级', '体系', '结构树', '家族'],
  matrix: ['矩阵', '象限', '横轴', '纵轴', '维度', '2x2'],
  'relationship-map': ['关系', '连接', '协同', '触点', '映射', '关系图', '辐射'],
  roadmap: ['路线图', '路线', '下一步', '推进', '计划', '里程碑'],
  'card-cluster': ['模块', '构成', '组成', '系统拆分', '卡片', '总览', '模板'],
};

function tokenize(slide) {
  const bag = [
    slide.title,
    slide.section,
    slide.pageGoal,
    slide.layoutAdvice,
    slide.imageAdvice,
    slide.designNotes,
    ...(slide.contentPoints || []),
    ...(slide.freeform || []),
  ]
    .filter(Boolean)
    .join(' | ')
    .toLowerCase();
  return bag;
}

function rankDiagramType(slide) {
  const text = tokenize(slide);
  const scoreMap = {};

  for (const type of DIAGRAM_TYPES) scoreMap[type] = 0;

  Object.entries(KEYWORDS).forEach(([type, words]) => {
    words.forEach((word) => {
      if (text.includes(word.toLowerCase())) scoreMap[type] += 1;
    });
  });

  if ((slide.layoutAdvice || '').includes('左') && (slide.layoutAdvice || '').includes('右')) {
    scoreMap.comparison += 1;
  }
  if ((slide.layoutAdvice || '').includes('矩阵')) scoreMap.matrix += 2;
  if ((slide.layoutAdvice || '').includes('流程')) scoreMap['process-flow'] += 2;
  if ((slide.layoutAdvice || '').includes('时间轴')) scoreMap.timeline += 2;

  let diagramType = 'card-cluster';
  let best = 0;
  Object.entries(scoreMap).forEach(([type, score]) => {
    if (score > best) {
      best = score;
      diagramType = type;
    }
  });

  // 明确优先：路线图 -> roadmap，时间轴 -> timeline
  const imageAdvice = (slide.imageAdvice || '').toLowerCase();
  if (imageAdvice.includes('路线图')) diagramType = 'roadmap';
  else if (imageAdvice.includes('时间轴')) diagramType = 'timeline';

  const confidence = Math.min(0.95, 0.35 + best * 0.12);
  const diagramNeeded = best >= 2 || /(图|矩阵|流程|关系|时间轴|路线)/.test(slide.imageAdvice || '');

  return { diagramType, confidence, diagramNeeded, scoreMap };
}

function makeDiagramData(slide, diagramType) {
  const points = (slide.contentPoints || []).filter(Boolean);
  const fallbackNodes = points.length ? points : [slide.pageGoal, slide.layoutAdvice, slide.imageAdvice].filter(Boolean);
  const nodes = fallbackNodes.slice(0, 6).map((text, idx) => ({ id: `n${idx + 1}`, label: text }));

  if (diagramType === 'comparison') {
    return {
      columns: nodes.slice(0, 3).map((n, i) => ({
        title: `维度 ${i + 1}`,
        bullets: [n.label],
      })),
    };
  }

  if (diagramType === 'matrix') {
    return {
      xAxis: '横轴维度',
      yAxis: '纵轴维度',
      quadrants: nodes.slice(0, 4).map((n, i) => ({ name: `Q${i + 1}`, text: n.label })),
    };
  }

  if (diagramType === 'relationship-map') {
    return {
      center: slide.section || slide.title || '核心主题',
      nodes: nodes.slice(0, 5),
    };
  }

  if (diagramType === 'hierarchy') {
    return {
      root: slide.section || slide.title || '上层',
      children: nodes.slice(0, 4),
    };
  }

  return {
    nodes,
    stages: nodes,
  };
}

function buildDiagramSpec(slide) {
  const { diagramType, confidence, diagramNeeded } = rankDiagramType(slide);

  const sourceFields = [
    ['页面目标', slide.pageGoal],
    ['核心内容', (slide.contentPoints || []).join('；')],
    ['建议版式', slide.layoutAdvice],
    ['建议图示 / 图片类型', slide.imageAdvice],
    ['设计注意事项', slide.designNotes],
  ]
    .filter(([, value]) => value)
    .map(([field]) => field);

  return {
    slideNumber: slide.no,
    slideTitle: `${slide.section ? `${slide.section}：` : ''}${slide.title}`,
    diagramNeeded,
    diagramType,
    confidence: Number(confidence.toFixed(2)),
    sourceFields,
    diagramData: makeDiagramData(slide, diagramType),
    layoutHint: slide.layoutAdvice || '右侧图示区',
  };
}

function buildDiagramSpecs(slides) {
  return slides.map(buildDiagramSpec);
}

module.exports = {
  buildDiagramSpecs,
};
