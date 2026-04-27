# scripts 目录说明

本目录用于放置自动化脚本。

当前提供：

- `generate-ppt.js`：PPTX 生成脚本占位文件（仅骨架与 TODO）。
- `generate-pptx.js`：基于 `output/05-ppt-storyboard/05_ppt_storyboard.md` 生成可编辑 `.pptx`。
- `lib/diagram-intent-parser.js`：逐页识别图示意图（diagram intent）并输出中间 spec。
- `lib/diagram-renderer.js`：使用 PptxGenJS `shape/text/line` 渲染可编辑图示（非图片）。
- `lib/diagram-layouts.js`：图示区域与主题样式配置。

## 使用约定

1. 当前阶段不安装依赖，不执行真实 PPT 生成。
2. 后续扩展时，优先保持输入输出路径与 `output/05`、`output/06` 对齐。
3. 所有脚本需保留中文注释与关键英文术语，便于跨团队协作。

## Diagram Spec 说明

运行 `generate-pptx.js` 时会自动生成：

- `output/05b-diagram-spec/05b_diagram_specs.json`

每页字段包括：

- `slideNumber`
- `slideTitle`
- `diagramNeeded`
- `diagramType`
- `confidence`
- `sourceFields`
- `diagramData`
- `layoutHint`

## 本地运行

1. 安装依赖：`npm install`
2. 生成 diagram spec + PPTX：`npm run generate:pptx`

## 调试某一页图示识别

可先生成 spec 后，用以下方式查看某页（以第 4 页为例）：

```bash
node -e "const fs=require('fs');const p='output/05b-diagram-spec/05b_diagram_specs.json';const d=JSON.parse(fs.readFileSync(p,'utf8'));console.log(d.find(x=>x.slideNumber===4));"
```
