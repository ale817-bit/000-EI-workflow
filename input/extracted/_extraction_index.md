# 输入资料提取索引（Extraction Index）

- 生成时间：2026-04-27 07:46:34 UTC
- 总文件数：7

| 源文件路径 | 文件类型 | 输出 Markdown 路径 | 读取状态 | 主要内容摘要 | 需要人工补充的问题 |
|---|---|---|---|---|---|
| `/workspace/000-EI-workflow/input/briefs/private/2a8f0a24e8af94c8231aa2ba4f333eea.png` | `image/png` | `/workspace/000-EI-workflow/input/extracted/briefs__2a8f0a24e8af94c8231aa2ba4f333eea.png.md` | 仅记录文件 | 图片文件仅记录元信息，未做 OCR。 | 请人工补充图片中的文字信息、图示含义与引用位置。 |
| `/workspace/000-EI-workflow/input/briefs/private/【0415】上海《人工智能大会》腾讯参展-展纲梳理.xlsx` | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` | `/workspace/000-EI-workflow/input/extracted/briefs__【0415】上海《人工智能大会》腾讯参展-展纲梳理.xlsx.md` | 成功 | 提取到 1 个 sheet，非空行 45 行。 | 无 |
| `/workspace/000-EI-workflow/input/briefs/private/梳理WAIC内容资料.docx` | `application/vnd.openxmlformats-officedocument.wordprocessingml.document` | `/workspace/000-EI-workflow/input/extracted/briefs__梳理WAIC内容资料.docx.md` | 成功 | 提取到段落 207 条，表格 0 个。 | 无 |
| `/workspace/000-EI-workflow/input/brand-assets/private/【中文规范】基础符号.pdf` | `application/pdf` | `/workspace/000-EI-workflow/input/extracted/brand-assets__【中文规范】基础符号.pdf.md` | 部分成功 | 无法解析 PDF 文本：No module named 'pypdf' | PDF 文本未提取成功，请人工补充品牌规范关键条款（logo、字体、色彩、禁用规则）。 |
| `/workspace/000-EI-workflow/input/brand-assets/private/【中文规范】延展图形.pdf` | `application/pdf` | `/workspace/000-EI-workflow/input/extracted/brand-assets__【中文规范】延展图形.pdf.md` | 部分成功 | 无法解析 PDF 文本：No module named 'pypdf' | PDF 文本未提取成功，请人工补充品牌规范关键条款（logo、字体、色彩、禁用规则）。 |
| `/workspace/000-EI-workflow/input/brand-assets/private/腾讯WAIC-视觉简报(1).pptx` | `application/vnd.openxmlformats-officedocument.presentationml.presentation` | `/workspace/000-EI-workflow/input/extracted/brand-assets__腾讯WAIC-视觉简报(1).pptx.md` | 部分成功 | 提取到 7 页 slide 文本。 | Slide 1 未检测到 notesSlide，需人工确认是否存在口播备注。；Slide 2 未检测到 notesSlide，需人工确认是否存在口播备注。；Slide 3 未检测到 notesSlide，需人工确认是否存在口播备注。；Slide 4 未检测到 notesSlide，需人工确认是否存在口播备注。；Slide 5 未检测到 notesSlide，需人工确认是否存在口播备注。；Slide 6 未检测到 notesSlide，需人工确认是否存在口播备注。；Slide 7 未检测到 notesSlide，需人工确认是否存在口播备注。 |
| `/workspace/000-EI-workflow/input/references/private/腾讯WAIC-视觉简报(1)(1).pptx` | `application/vnd.openxmlformats-officedocument.presentationml.presentation` | `/workspace/000-EI-workflow/input/extracted/references__腾讯WAIC-视觉简报(1)(1).pptx.md` | 部分成功 | 提取到 7 页 slide 文本。 | Slide 1 未检测到 notesSlide，需人工确认是否存在口播备注。；Slide 2 未检测到 notesSlide，需人工确认是否存在口播备注。；Slide 3 未检测到 notesSlide，需人工确认是否存在口播备注。；Slide 4 未检测到 notesSlide，需人工确认是否存在口播备注。；Slide 5 未检测到 notesSlide，需人工确认是否存在口播备注。；Slide 6 未检测到 notesSlide，需人工确认是否存在口播备注。；Slide 7 未检测到 notesSlide，需人工确认是否存在口播备注。 |

## 状态统计
- 仅记录文件：1
- 成功：2
- 部分成功：4
