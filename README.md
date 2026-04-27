# 000-EI-workflow

“000-EI-workflow” 是一个面向**展厅平面视觉系统**的半自动工作流骨架项目。

项目聚焦于从输入材料出发，形成结构化中间产物与最终交付建议，支持团队在策划、叙事、视觉策略、系统化设计与汇报阶段保持一致。

## 项目用途

基于展厅策划案、需求文档、品牌资料、参考案例，半自动输出以下七类成果：

1. 需求解析文档（Requirement Analysis）
2. 展厅叙事结构文档（Narrative Structure）
3. 平面视觉策略文档（Visual Strategy）
4. 展厅平面视觉系统文档（Graphic System）
5. PPT 汇报 Storyboard
6. 可生成 PPTX 的脚本基础（当前为占位）
7. 归档说明和交付清单

> 当前仓库仅搭建流程框架，不包含真实项目内容与自动化执行结果。

## 工作流程（建议）

1. 将输入材料放入 `input/` 对应目录。
2. 依据 `templates/` 模板与 `.agents/skills/` 技能说明执行各阶段工作。
3. 在 `output/` 对应阶段目录中产出结果文档。
4. 使用 `templates/design-review-checklist.md` 进行内部评审。
5. 使用 `templates/archive-readme-template.md` 组织最终归档。
6. 后续可扩展 `scripts/generate-ppt.js` 实现真实 PPTX 自动生成。

## 目录结构

```text
000-EI-workflow/
├─ AGENTS.md
├─ README.md
├─ input/
│  ├─ briefs/
│  ├─ brand-assets/
│  └─ references/
├─ output/
│  ├─ 01-requirement-analysis/
│  ├─ 02-narrative-structure/
│  ├─ 03-visual-strategy/
│  ├─ 04-graphic-system/
│  ├─ 05-ppt-storyboard/
│  ├─ 06-ppt-output/
│  └─ 07-archive-package/
├─ templates/
│  ├─ requirement-analysis-template.md
│  ├─ narrative-structure-template.md
│  ├─ visual-strategy-template.md
│  ├─ graphic-system-template.md
│  ├─ ppt-storyboard-template.md
│  ├─ design-review-checklist.md
│  └─ archive-readme-template.md
├─ .agents/
│  └─ skills/
│     ├─ brief-analyzer/
│     ├─ exhibition-narrative/
│     ├─ visual-strategy/
│     ├─ graphic-system-builder/
│     ├─ ppt-storyboard/
│     └─ archive-producer/
└─ scripts/
   ├─ README.md
   └─ generate-ppt.js
```

## 使用方式

### 1) 准备输入

- 策划案、需求说明放入 `input/briefs/`
- 品牌规范、LOGO、字体/色彩约束放入 `input/brand-assets/`
- 对标案例、灵感图、历史资料放入 `input/references/`

### 2) 执行阶段任务

按以下顺序使用技能与模板：

- brief-analyzer → 需求解析
- exhibition-narrative → 叙事结构
- visual-strategy → 视觉策略
- graphic-system-builder → 平面视觉系统
- ppt-storyboard → 汇报 storyboard
- archive-producer → 归档与交付清单

### 3) 产出与复核

- 将阶段产出存放至 `output/01`~`output/07` 对应目录。
- 评审时使用 `templates/design-review-checklist.md`。
- 最终打包时补全 `output/07-archive-package/README`（可基于模板）。

## 当前状态

- ✅ 已完成：工作流目录、模板、技能说明、脚本占位文件。
- ⏳ 待扩展：真实文档自动生成逻辑、PPTX 渲染与样式引擎、质量评分工具。
