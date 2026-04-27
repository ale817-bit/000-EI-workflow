---
name: input-normalizer
description: 将任意原始项目文件标准化为 GitHub 可读、可审阅、可追溯的 normalized 输入层，供后续 workflow 阶段使用。
---

# input-normalizer

## 使用场景
- 新项目导入阶段，原始资料格式混杂（docx/xlsx/pptx/pdf/png/jpg/ai/psd 等）。
- 需要先完成输入标准化，再进入 brief-analyzer。

## 输入材料
- `input/raw/briefs/`
- `input/raw/brand-assets/`
- `input/raw/references/`

## 工作步骤
1. 运行 `npm run normalize`。
2. 读取 `input/normalized/_index.md`，确认每个源文件状态。
3. 对“需人工补充”条目，在 `input/manual-notes/` 填写补充记录。
4. 仅当 `input/normalized/` 满足可读性要求后，进入 `brief-analyzer`。

## 输出格式
- `input/normalized/briefs/*.md`
- `input/normalized/brand-assets/*.md`
- `input/normalized/references/*.md`
- `input/normalized/images/*.md`
- `input/normalized/_index.md`

## 检查标准
- 每个原始文件都应有对应 normalized 输出或失败记录。
- 无法解析的文件必须写明“需人工补充”且不中断流程。
- 后续阶段引用输入时优先使用 `input/normalized/`。

## 禁止事项
- 不得直接在后续阶段依赖 `input/raw/` 二进制内容作为唯一证据。
- 不得覆盖 `input/raw/` 原始文件。
- 不得跳过索引检查直接进入需求分析。
