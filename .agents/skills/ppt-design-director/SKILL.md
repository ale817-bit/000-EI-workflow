---
name: ppt-design-director
description: 将展厅视觉系统内容转译为简约、现代、可编辑的 PPT 设计规则与页面导演方案。
---

# ppt-design-director

## 使用场景
- 已完成 `output/03`~`output/05`，需要先做 PPT 设计导演层定义（非直接出片）。

## 输入材料
- `output/05-ppt-storyboard/05_ppt_storyboard.md`
- `output/03-visual-strategy/03_visual_strategy.md`
- `output/04-graphic-system/04_graphic_system.md`
- `input/extracted/manual_tencent_brand_notes.md`
- `templates/ppt-modern-minimal-style-guide.md`
- `templates/ppt-page-layout-rules.md`

## 工作步骤
1. 定义整套汇报的视觉语气：简约、现代、干净、留白优先、层级明确。
2. 将 storyboard 每页映射到标准页面模板（封面/目录/规则页/应用页/风险页等）。
3. 为每页指定：标题层级、文本密度上限、图片占位策略、备注区写法。
4. 统一跨页规则：色彩节奏、标题位置、页脚信息、图文比例、页间连贯性。
5. 输出“导演指令”：哪些页必须设计师补图、哪些页可自动排版。

## 输出格式
- 使用 Markdown 输出页级导演清单。
- 所有规则必须可落地到可编辑 `.pptx`（文本框、形状、图片占位、备注）。

## 检查标准
- 不出现赛博朋克、重装饰、密集渐变风格。
- 单页主信息明确，避免信息过载。
- 样式规则可由 `pptxgenjs` 脚本消费。

## 禁止事项
- 不得输出“图片拼接式”不可编辑 PPT。
- 不得依赖复杂动效作为主要信息表达方式。
- 不得绕过品牌与视觉系统硬约束。
