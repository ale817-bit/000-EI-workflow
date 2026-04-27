# scripts 目录说明

本目录用于放置自动化脚本。

当前提供：

- `generate-ppt.js`：PPTX 生成脚本占位文件（仅骨架与 TODO）。
- `generate-pptx.js`：基于 storyboard 生成可编辑 PPT，并自动输出图示识别 spec。

## 使用约定

1. 当前阶段不安装依赖，不执行真实 PPT 生成。
2. 后续扩展时，优先保持输入输出路径与 `output/05`、`output/06` 对齐。
3. 所有脚本需保留中文注释与关键英文术语，便于跨团队协作。

## generate-pptx 增强能力

1. 解析 `## Slide 01｜封面：标题` 等多种 Slide 标题格式。
2. 解析字段：页面目标、核心内容、建议版式、建议图示、视觉系统规则、输入依据、设计注意事项、人工补充项。
3. 生成可编辑图示（process-flow / timeline / comparison / hierarchy / matrix / relationship-map / roadmap / card-cluster）。
4. 输出中间产物：`output/05b-diagram-spec/05b_diagram_specs.json`。
