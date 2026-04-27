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
6. 可生成 PPTX 的脚本基础
7. 归档说明和交付清单

> 当前仓库仅搭建流程框架，不包含真实项目内容与自动化执行结果。

## 工作流程（建议）

- input-normalizer → brief-analyzer → exhibition-narrative → visual-strategy → graphic-system-builder → ppt-storyboard → ppt-design-director → pptx-output-builder → archive-producer

## 目录结构

```text
000-EI-workflow/
├─ AGENTS.md
├─ README.md
├─ input/
│  ├─ raw/
│  │  ├─ briefs/
│  │  ├─ brand-assets/
│  │  └─ references/
│  ├─ normalized/
│  │  ├─ briefs/
│  │  ├─ brand-assets/
│  │  ├─ references/
│  │  ├─ images/
│  │  └─ _index.md
│  └─ manual-notes/
├─ output/
│  ├─ 01-requirement-analysis/
│  ├─ 02-narrative-structure/
│  ├─ 03-visual-strategy/
│  ├─ 04-graphic-system/
│  ├─ 05-ppt-storyboard/
│  ├─ 06-ppt-output/
│  └─ 07-archive-package/
├─ templates/
├─ .agents/skills/
└─ scripts/
```

## 如何导入新项目资料

1. 把原始文件放入：
   - `input/raw/briefs/`
   - `input/raw/brand-assets/`
   - `input/raw/references/`
2. 运行标准化脚本：
   - `npm run normalize`
3. 检查标准化索引：
   - `input/normalized/_index.md`
4. 对“需人工补充”条目，补充到：
   - `input/manual-notes/`
5. 再执行 `brief-analyzer` 进入后续阶段。

## 使用方式

### 1) 输入标准化

- 原始文件仅存放在 `input/raw/`
- 后续工作流只读取 `input/normalized/`
- 若存在无法自动解析项，必须在 `input/manual-notes/` 补充后再推进结论

### 2) 执行阶段任务

按以下顺序使用技能与模板：

- input-normalizer → 输入标准化
- brief-analyzer → 需求解析
- exhibition-narrative → 叙事结构
- visual-strategy → 视觉策略
- graphic-system-builder → 平面视觉系统
- ppt-storyboard → 汇报 storyboard
- ppt-design-director → 汇报视觉导演
- pptx-output-builder → 可编辑 PPTX 生成
- archive-producer → 归档与交付清单

### 3) 产出与复核

- 将阶段产出存放至 `output/01`~`output/07` 对应目录。
- 评审时使用 `templates/design-review-checklist.md`。
- 最终打包时补全 `output/07-archive-package/README`（可基于模板）。

## 当前状态

- ✅ 已完成：工作流目录、模板、技能说明、标准化脚本与 PPTX 脚本框架。
- ⏳ 待扩展：更多文件格式解析增强、质量评分工具、自动审校链路。
