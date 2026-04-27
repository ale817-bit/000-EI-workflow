# 00 输入资料完整性检查（基于 extracted Markdown 重检）

## 背景/目标
- 目的：基于 `input/extracted/` 的结构化提取结果，重新评估是否可继续执行 workflow 第 01 阶段后续工作。
- 本次检查范围：
  - 优先：`input/extracted/_extraction_index.md` + `input/extracted/*.md`
  - 辅助：原始文件路径命名信息（仅做文件名级别辅助，不回退做原始全文重读）
- 约束：不生成视觉系统、不生成 PPT、不进入 exhibition-narrative 阶段。

---

## 1. 当前提取后的 Markdown 是否足够进入 workflow

**结论：可进入 workflow（第 01 阶段内部推进）但需“条件放行”。**

- 可推进依据：
  1) `brief` 主体内容已可读（DOCX + XLSX 提取成功）。【来源：extracted Markdown】
  2) 品牌简报 PPT 文本已可读（两份 PPTX 均提取到 7 页文本）。【来源：extracted Markdown】
  3) 已形成统一索引，能定位每个源文件状态与人工补充点。【来源：extracted Markdown】
- 条件放行原因：
  1) 两份品牌 PDF 仍无法提取正文；
  2) 一张 PNG 仅记录文件，未 OCR；
  3) PPT 备注（notes）缺失或不可读。
  上述缺口会影响需求精度，但不阻断 01 阶段继续细化。
  【来源：extracted Markdown】

---

## 2. 已明确且可直接使用的信息

### 2.1 可直接使用（内容级）
1. 项目语境：上海人工智能大会（WAIC）腾讯参展，主题出现“Hello，我的AI好友”。【来源：extracted Markdown】
2. 基础参数：出现“面积约 300 平方米、预算 250w、展会日期 2026-07-03 至 2026-07-06”。【来源：extracted Markdown】
3. 叙事骨架：三大板块递进结构（个人体验 / 企业技术 / 社会生态方向）。【来源：extracted Markdown】
4. 展项与设备线索：XLSX 已提取出大量“展项名称-内容-设备-平面需求”字段。 【来源：extracted Markdown】
5. 品牌硬约束（来自品牌 PPT 文本）：
   - logo 使用规则（中文字标不可单独使用等）
   - 字体规则（腾讯体 W7 / 思源黑体 / 腾讯体 W3）
   - 延展图形“斜 8 度”原则
   - 腾讯蓝主色及部分色值信息
   【来源：extracted Markdown】

### 2.2 可直接使用（文件管理级）
6. 全部 7 份源文件已建立一一对应的 extracted Markdown 映射。 【来源：extracted Markdown】
7. 读取状态清晰：成功 2、部分成功 4、仅记录文件 1。 【来源：extracted Markdown】

### 2.3 文件名辅助可用信息（非正文）
8. 路径分类完整：`briefs / brand-assets / references` 三类均有真实输入。 【来源：原始文件名推断】

---

## 3. 仍需人工补充的信息

### 3.1 必补（P0）
1. 两份 PDF 品牌规范正文（基础符号/延展图形）关键条款未提取。  
   - 影响：可能遗漏严格禁用项、尺寸阈值、最小留白、应用边界。  
   - 当前状态：需人工补录。  
   【来源：extracted Markdown】
2. PNG 文件内容语义未识别（未 OCR）。  
   - 影响：可能丢失关键信息图/截图中的业务输入。  
   - 当前状态：需人工说明用途与关键信息。  
   【来源：extracted Markdown】
3. PPT 备注信息（notes）不可读或不存在。  
   - 影响：可能缺失讲述口径、限制条件、页级解释。  
   - 当前状态：需人工确认是否另有讲稿。  
   【来源：extracted Markdown】

### 3.2 建议补充（P1）
4. 01 阶段最终基线 brief 版本号（当前有多处文本口径，存在“18 子展项/26 展项”并存迹象）。  
   - 影响：需求拆解基线不一致会导致后续口径偏差。  
   【来源：extracted Markdown + 待确认】
5. 预算口径说明（250w 是否含结构/多媒体/内容制作）。  
   - 影响：影响需求优先级与可执行边界。  
   【来源：extracted Markdown + 待确认】
6. 展位平面基础文件（CAD/PDF/消防限高/开口方向）是否已锁定。  
   - 影响：影响导视与信息承载判断。  
   【来源：待确认】

---

## 4. 来源标注规则与本次判定口径

为避免混淆，本文件使用以下来源标签：

1. **【来源：extracted Markdown】**  
   指来自 `input/extracted/*.md` 的可见文本与索引状态。
2. **【来源：原始文件名推断】**  
   仅依据源文件路径或文件名可确认的信息（如类别、主题词、地名等）。
3. **【来源：待确认】**  
   当前 extracted 内容无法支持、且原始文件名也不能确定的信息。

> 当前结论优先使用 extracted Markdown；除文件命名辅助外，不以“未重新提取的原始正文”作为结论依据。

---

## 5. 对 workflow 推进的建议（仅限第 01 阶段）

1. 可继续推进第 01 阶段需求解析的“结构化整理与问题闭环”。【来源：extracted Markdown】
2. 不进入 02 阶段（exhibition-narrative），直到 P0 缺口至少补齐 PDF 关键条款与 PNG 语义说明。 【来源：设计流程约束 + 待确认】
3. 使用 `input/extracted/_manual_notes_template.md` 收集人工补充，并回填到索引。 【来源：extracted Markdown】

---

## 6. 推荐执行顺序（当前仅限输入补完）

1. 先补人工信息：
   - PDF 两份关键规范条款（logo / 字体 / 色彩 / 禁用规则）
   - PNG 文件内容用途与文字信息
   - PPT 备注页是否另有讲稿
   【来源：extracted Markdown】
2. 更新 `input/extracted/_extraction_index.md` 的“主要内容摘要/人工问题”状态。 【来源：extracted Markdown】
3. 在 01 阶段文档中同步更新“已确认/待确认”边界，不启动叙事阶段。 【来源：流程约束】

---

## 7. 本次重检结论（简版）

- **可进入 workflow：是（仅限 01 阶段继续）**。 【来源：extracted Markdown】
- **可直接使用信息：已有较高覆盖（brief 主体 + 展项结构 + 品牌 PPT 文本）**。 【来源：extracted Markdown】
- **必须人工补充：PDF 正文、PNG 语义、PPT 备注信息**。 【来源：extracted Markdown】
- **当前不执行：视觉系统 / PPT / exhibition-narrative**。 【来源：流程约束】

