# 03 平面视觉策略文档（Visual Strategy）

## 0.1 基于 normalized 输入的复核结论（2026-04-27）
- 经复核，`input/normalized/_index.md` 暂无有效条目，`input/normalized/` 暂无可引用业务文本数据。
- `input/manual-notes/` 目前无人工补充说明。
- 判断：本文件中涉及品牌与策略细则的内容缺少 normalized 证据闭环，应标记为“待 normalized 复核稿”。
- 处理：不重写策略章节，仅新增状态声明；后续仅对“输入依据、品牌约束、风险与待确认”做必要修订。


## 0. 文档说明
- 阶段：workflow 第 03 阶段（visual-strategy）。
- 输入依据：
  1) `input/extracted/_extraction_index.md`
  2) `input/extracted/manual_tencent_brand_notes.md`
  3) `input/extracted/*.md`
  4) `output/01-requirement-analysis/00_input_readiness_check.md`
  5) `output/01-requirement-analysis/01_requirement_analysis.md`
  6) `output/02-narrative-structure/02_narrative_structure.md`
- 输出边界：本文件为“策略层”，不生成完整平面视觉系统、不生成 PPT、不输出设计稿。

---

## 1. 视觉策略总判断

### 1.1 当前项目的视觉策略核心
- 核心策略：以“可读、可导、可交互”的信息秩序承接“AI 友邻”叙事，将“友”（亲和互动）与“邻”（专业可靠）在同一版式与图形体系中并置。  
【依据：来自 extracted 文本 + 来自 manual_tencent_brand_notes.md + 来自 02_narrative_structure.md】

### 1.2 视觉策略如何承接“AI 友邻”
- “友”：通过低门槛信息入口、双向交流符号、柔和渐变与轻量关系图形传达可接近性。  
【依据：来自 manual_tencent_brand_notes.md + 设计推导】
- “邻”：通过稳定网格、高可读层级、克制背景噪声与腾讯蓝主导传达可靠性。  
【依据：来自 manual_tencent_brand_notes.md + 来自 02_narrative_structure.md】

### 1.3 如何遵守腾讯斜 8 度延展图形规范
- 斜 8 度用于结构，不用于装饰：优先作用于标题区切割、信息卡片边界、导视构件和屏幕模块骨架。  
【依据：来自 manual_tencent_brand_notes.md】
- 禁止引入与斜 8 度冲突的随机斜线系统、过度发光霓虹线与无序几何。  
【依据：来自 manual_tencent_brand_notes.md】

### 1.4 事实依据与推导边界
- 事实依据：品牌标志/字体/色彩/斜 8 度规则、三段叙事结构、展项类型与设备形态。  
【依据：来自 manual_tencent_brand_notes.md + 来自 extracted 文本 + 来自 02_narrative_structure.md】
- 推导部分：关键词落地方法、场景映射、信息密度控制与节奏策略。  
【依据：设计推导】

---

## 2. 视觉概念命名（候选）

### 候选 A：**双轴友邻**（推荐）
- 含义：以“亲和互动轴（友）+ 专业承载轴（邻）”双轴组织视觉表达。  
【依据：来自 manual_tencent_brand_notes.md + 来自 02_narrative_structure.md】
- 适用性：可直接映射三大板块与 C/ToB 双类信息需求。  
【依据：来自 02_narrative_structure.md + 设计推导】
- 风险：若双轴权重失衡，可能出现“过于活泼”或“过于理工”单边倾斜。  
【依据：设计推导】

### 候选 B：**对话式秩序**
- 含义：以对话关系作为视觉母题，以秩序化网格保证可读与可执行。  
【依据：来自 manual_tencent_brand_notes.md + 设计推导】
- 适用性：适合展板、信息图、屏幕 UI 的统一结构表达。  
【依据：来自 extracted 文本 + 设计推导】
- 风险：若“对话元素”比例过高，可能稀释技术信息密度。  
【依据：设计推导】

### 候选 C：**蓝核协同网络**
- 含义：以腾讯蓝为核心识别色，以协同网络关系组织端-云-脑-生态信息。  
【依据：来自 manual_tencent_brand_notes.md + 来自 extracted 文本】
- 适用性：适合第二板块技术结构与生态关系展示。  
【依据：来自 02_narrative_structure.md】
- 风险：若仅强调“网络结构”，会削弱“友邻”的人本感。  
【依据：设计推导】

### 推荐主概念
- 推荐：**双轴友邻**。  
- 理由：同时覆盖“友”的亲和体验与“邻”的专业承载，最符合当前叙事与品牌约束双重输入。  
【依据：来自 02_narrative_structure.md + 来自 manual_tencent_brand_notes.md + 设计推导】

---

## 3. 视觉关键词系统（5-8 个）

| 关键词 | 具体设计手段 | 可落地平面场景 |
|---|---|---|
| 双向交流 | 对话气泡、双向箭头、左右信息呼应模块 | 入口主题墙、交互说明牌、屏幕 UI |
| 斜 8 度秩序 | 标题区斜切、卡片边界斜切、导视角度统一 | 展板、导视、信息图、UI |
| 蓝核主导 | 腾讯蓝作为主背景/主标题/主导航色 | 主视觉 KV、导视主牌、一级标题 |
| 低噪声承载 | 背景对比度下调、减少装饰线、保留阅读留白 | ToB 内容区、技术展板、方案说明 |
| 模块化信息 | 卡片化、矩阵化、分层编号、图文分区 | 展板系统、信息图系统、UI 模块 |
| 关系可视化 | 端-云-脑/产品-场景/能力-结果关系图 | 第二板块信息图、数据墙 |
| 亲和触达 | 柔和渐变、圆角信息块、低压阅读节奏 | C 端体验区、互动区、宣发物料 |
| 可验证结果 | “结论先行+证据补充”双层信息结构 | 深度讲解区、技术说明区 |

【依据：来自 manual_tencent_brand_notes.md + 来自 02_narrative_structure.md + 来自 extracted 文本 + 设计推导】

---

## 4. 图形母题策略

### 4.1 如何使用腾讯斜 8 度
- 作为结构约束：版式切割、标题容器、导视边界、信息卡片外形。  
【依据：来自 manual_tencent_brand_notes.md】
- 作为动势约束：动态转场方向保持同向逻辑，避免多角度冲突。  
【依据：来自 manual_tencent_brand_notes.md + 设计推导】

### 4.2 如何使用对话气泡 / 双向交流 / 连接关系
- 对话气泡用于“用户问题—AI 回应”类内容，不泛化为所有模块外形。  
【依据：来自 manual_tencent_brand_notes.md + 设计推导】
- 双向连接用于表达协同与反馈链路，不用于无意义装饰连接线。  
【依据：来自 extracted 文本 + 设计推导】

### 4.3 如何处理“友”的亲和感
- 通过低压阅读节奏、柔和过渡色、互动反馈图形实现。  
【依据：来自 manual_tencent_brand_notes.md】
- 避免儿童化、拟人夸张化、卡通化过重表达。  
【依据：来自 manual_tencent_brand_notes.md】

### 4.4 如何处理“邻”的专业感和可靠性
- 通过稳定网格、明确信息层级、腾讯蓝主导和低噪声背景实现。  
【依据：来自 manual_tencent_brand_notes.md + 来自 02_narrative_structure.md】

### 4.5 如何避免三类过度风险
- 过度赛博朋克：禁止高饱和霓虹线、密集粒子、强发光背景。  
【依据：来自 manual_tencent_brand_notes.md】
- 过度卡通化：禁止过于幼稚插画化与表情化主图。  
【依据：来自 manual_tencent_brand_notes.md】
- 过度装饰化：所有图形需服务信息结构与阅读路径。  
【依据：来自 02_narrative_structure.md + 设计推导】

---

## 5. 色彩策略

### 5.1 腾讯蓝主色使用方式
- 腾讯蓝作为主识别色、主结构色、主标题色。  
【依据：来自 manual_tencent_brand_notes.md】
- 关键入口、一级标题、主导视与核心结论区优先使用腾讯蓝。  
【依据：来自 manual_tencent_brand_notes.md + 来自 02_narrative_structure.md】

### 5.2 辅助色（青/绿/紫）使用边界
- 青：用于连接/响应/数据流转类提示。  
- 绿：用于生态/开放/共创类语义。  
- 紫：用于创意/多模态/互动强化点。  
【依据：来自 manual_tencent_brand_notes.md】
- 辅助色仅做局部强调，不得替代腾讯蓝成为主视觉主色。  
【依据：来自 manual_tencent_brand_notes.md】

### 5.3 渐变使用规则
- 渐变必须以腾讯蓝为起点或骨架色。  
【依据：来自 manual_tencent_brand_notes.md】
- 渐变服务层级区分与语义引导，禁止仅为“炫光效果”。  
【依据：来自 manual_tencent_brand_notes.md + 设计推导】

### 5.4 高对比 vs 低噪声场景
- 高对比适用：导视主信息、紧急引导、关键数据结论、入口主题标题。  
【依据：来自 02_narrative_structure.md + 设计推导】
- 低噪声适用：技术解释区、ToB 方案区、长文本阅读区。  
【依据：来自 02_narrative_structure.md + 来自 manual_tencent_brand_notes.md】

### 5.5 禁止色彩倾向
- 禁止重赛博霓虹、黑底蓝光极端对比、过量高饱和辅助色铺底。  
【依据：来自 manual_tencent_brand_notes.md】

---

## 6. 字体与标题策略

### 6.1 W7 / W3 / 思源黑体关系
- 腾讯体 W7：用于主标题、关键数字、强调语句。  
【依据：来自 manual_tencent_brand_notes.md】
- 思源黑体：正文主承载字体。  
【依据：来自 manual_tencent_brand_notes.md】
- 腾讯体 W3：辅助说明与与 W7 搭配层级。  
【依据：来自 manual_tencent_brand_notes.md】

### 6.2 层级建议（策略级）
- 主标题：W7，高识别、短句、单层语义。  
- 分区标题：W7/W3 组合，强调分区主题。  
- 展板标题：W7 中等字重，配副标题。  
- 正文：思源黑体优先，控制行长与行距。  
- 注释：W3 或思源黑体小号，保持可读。  
【依据：来自 manual_tencent_brand_notes.md + 设计推导】

### 6.3 中英文混排规则
- 中文使用腾讯体系时，英文应匹配腾讯英文风格，避免风格割裂。  
【依据：来自 manual_tencent_brand_notes.md】

---

## 7. 版式策略

### 7.1 展板系统版式
- 采用“主标题区—核心结论区—证据说明区”三段式。  
【依据：来自 02_narrative_structure.md + 设计推导】

### 7.2 信息图版式
- 优先网格化与模块化：关系图、流程图、矩阵图分层呈现。  
【依据：来自 extracted 文本 + 来自 manual_tencent_brand_notes.md】

### 7.3 导视版式
- 远距识别优先：高对比、短文本、明确箭头与编号。  
【依据：来自 01_requirement_analysis.md + 设计推导】

### 7.4 屏幕 UI 版式
- 卡片化 + 对话式布局，保持层级统一，避免游戏化堆叠。  
【依据：来自 manual_tencent_brand_notes.md + 来自 extracted 文本】

### 7.5 宣发物料版式
- 保持与展厅主体系同构（色彩主次、标题逻辑、图形母题一致）。  
【依据：来自 manual_tencent_brand_notes.md + 设计推导】

### 7.6 PPT 汇报版式（仅策略输入）
- 延续“结论先行、证据补充、单页单主信息”原则。  
【依据：来自 01_requirement_analysis.md + 来自 02_narrative_structure.md】
- 注：此处仅为后续 storyboard 输入，不生成 PPT。  
【依据：流程约束】

---

## 8. 应用场景策略

### 8.1 主视觉 KV
- 目标：统一主概念识别与品牌主导色。  
【依据：来自 manual_tencent_brand_notes.md + 来自 02_narrative_structure.md】

### 8.2 入口主题墙
- 目标：快速建立“AI 友邻”第一印象与导览入口。  
【依据：来自 02_narrative_structure.md】

### 8.3 展板
- 目标：清晰传达展项价值、能力证据与场景结果。  
【依据：来自 extracted 文本 + 来自 01_requirement_analysis.md】

### 8.4 导视 / 标识
- 目标：路径可达、分区清晰、排队与回流有序。  
【依据：来自 01_requirement_analysis.md + 设计推导】

### 8.5 信息图
- 目标：把复杂技术关系压缩为可理解结构。  
【依据：来自 extracted 文本 + 设计推导】

### 8.6 屏幕 UI / 多媒体画面
- 目标：支持实时交互反馈与层级化读屏。  
【依据：来自 extracted 文本 + 来自 manual_tencent_brand_notes.md】

### 8.7 宣发物料
- 目标：延续主视觉语义并适配传播场景。  
【依据：来自 manual_tencent_brand_notes.md】

### 8.8 周边物料
- 目标：作为辅助视觉延展，强化品牌记忆但不喧宾夺主。  
【依据：来自 manual_tencent_brand_notes.md + 设计推导】

---

## 9. 风险与待确认

### 9.1 受限于 PDF 解析不完整的判断
- 原始 PDF 未全量机器解析，精细阈值（安全区、最小字号、比例细则）可能遗漏。  
【依据：来自 extracted 文本 + 待确认】

### 9.2 需要人工复核的品牌项
- Logo 组合边界、基础符号矢量规范、字体授权文件、PDF 原始条款。  
【依据：来自 manual_tencent_brand_notes.md + 待确认】

### 9.3 不能直接进入最终视觉设计的内容
- 未经 PDF 原文复核的禁用项判断。  
- 未确认尺寸与材料约束下的大面积图形比例。  
- 未验证的设备参数对应界面细节。  
【依据：来自 00_input_readiness_check.md + 来自 01_requirement_analysis.md + 待确认】

---

## 10. 对下一阶段 graphic-system-builder 的输入建议

### 10.1 需要固化成系统规则的内容
1. 斜 8 度结构在各场景的统一应用边界。  
2. 腾讯蓝主导与辅助色上限规则。  
3. 字体层级（W7/W3/思源黑体）与中英混排规范。  
4. “友/邻”双属性在不同场景的表达权重。  
【依据：来自 manual_tencent_brand_notes.md + 来自 03_visual_strategy.md（本文件）】

### 10.2 需要转成具体规范模块的内容
- 色彩规则：主色/辅助色/渐变/禁用色倾向。  
- 字体规则：字号梯度、行距、字重、混排规则。  
- 网格规则：展板、导视、UI、信息图的网格模板。  
- 图形规则：斜 8 度、对话母题、连接关系、背景噪声控制。  
- 图标规则：线性/面性统一、语义映射与最小尺寸。  
- 信息图规则：关系图、流程图、矩阵图模板与注释标准。  
- 导视规则：编号、箭头、距离可读性与分级导向。  
【依据：来自 manual_tencent_brand_notes.md + 来自 01_requirement_analysis.md + 来自 02_narrative_structure.md + 设计推导】

---

## 当前状态声明
- 本文档为第 03 阶段视觉策略输出稿（可评审版）。
- 未生成完整平面视觉系统。
- 未生成 PPT。
- 未输出设计稿。
- 所有不确定项已标注“待确认”。

