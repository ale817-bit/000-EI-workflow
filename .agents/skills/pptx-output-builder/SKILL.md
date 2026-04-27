---
name: pptx-output-builder
description: 基于 storyboard 和风格模板生成可编辑 .pptx 的脚本化产出框架（PptxGenJS）。
---

# pptx-output-builder

## 使用场景
- 已有 storyboard 与视觉规则，需生成 `output/06-ppt-output/` 下可编辑 PPTX。

## 输入材料
- `output/05-ppt-storyboard/05_ppt_storyboard.md`
- `templates/ppt-modern-minimal-style-guide.md`
- `templates/ppt-page-layout-rules.md`
- `scripts/generate-pptx.js`

## 工作步骤
1. 读取 storyboard（页码、标题、核心内容、版式、图示、备注）。
2. 将页面类型映射到固定 layout 模板（16:9）。
3. 为每页创建可编辑对象：
   - 标题文本框
   - 内容文本框
   - 图片占位框
   - 备注（speaker notes）
4. 将文件输出到 `output/06-ppt-output/`。
5. 输出日志：生成页数、缺失字段、需人工补图页。

## 输出格式
- 生成 `.pptx` 文件（非图片合集）。
- 同目录生成构建日志（可选 `.md` 或 `.json`）。

## 检查标准
- 所有页面文本可编辑。
- 版式符合简约现代风格，不使用花哨动效。
- 缺失素材页明确保留占位框，不报错中断。

## 禁止事项
- 不得将整页内容固化为单张图片。
- 不得在脚本中写死项目私密文案。
- 不得输出与 storyboard 页序冲突的文件。
