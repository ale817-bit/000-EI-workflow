#!/usr/bin/env python3
"""
extract-inputs.py

将 input/*/private 下的资料提取为统一 Markdown，输出到 input/extracted/。
优先使用标准库与环境已有库；无法解析时优雅降级，不中断流程。
"""

from __future__ import annotations

import argparse
import datetime as dt
import mimetypes
import re
import traceback
import zipfile
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]


@dataclass
class Record:
    source_path: Path
    category: str
    file_type: str
    output_path: Path
    status: str
    summary: str
    manual_questions: List[str]


def sanitize_filename(name: str) -> str:
    # 保留中文语义，替换不适合路径管理的字符。
    name = name.replace("/", "_").replace("\\", "_")
    name = re.sub(r"[\r\n\t]", " ", name)
    name = re.sub(r"[<>:\"|?*]", "_", name)
    name = re.sub(r"\s+", " ", name).strip()
    return name


def make_output_name(category: str, source_path: Path) -> str:
    safe = sanitize_filename(source_path.name)
    return f"{category}__{safe}.md"


def guess_file_type(path: Path) -> str:
    mime, _ = mimetypes.guess_type(path.name)
    if mime:
        return mime
    return f"unknown/{path.suffix.lower().lstrip('.')}" if path.suffix else "unknown"


def write_markdown(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def md_header(source: Path, file_type: str) -> str:
    now = dt.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    return (
        f"# 输入资料提取\n\n"
        f"- 源文件：`{source.as_posix()}`\n"
        f"- 文件类型：`{file_type}`\n"
        f"- 提取时间：{now}\n\n"
    )


def extract_docx(path: Path) -> Tuple[str, str, List[str]]:
    ns = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
    with zipfile.ZipFile(path) as zf:
        xml = zf.read("word/document.xml")
    root = ET.fromstring(xml)

    lines: List[str] = ["## 提取内容（段落 + 表格）", ""]
    para_count = 0
    table_count = 0

    for body in root.findall(".//w:body", ns):
        for child in list(body):
            tag = child.tag.split("}")[-1]
            if tag == "p":
                texts = [t.text for t in child.findall(".//w:t", ns) if t.text]
                text = "".join(texts).strip()
                if text:
                    para_count += 1
                    lines.append(f"- {text}")
            elif tag == "tbl":
                table_count += 1
                rows = child.findall(".//w:tr", ns)
                lines.append("")
                lines.append(f"### 表格 {table_count}")
                matrix: List[List[str]] = []
                for r in rows:
                    cells = []
                    for c in r.findall(".//w:tc", ns):
                        texts = [t.text for t in c.findall(".//w:t", ns) if t.text]
                        cells.append("".join(texts).strip())
                    if any(cells):
                        matrix.append(cells)

                if matrix:
                    col_count = max(len(r) for r in matrix)
                    for r in matrix:
                        if len(r) < col_count:
                            r.extend([""] * (col_count - len(r)))
                    header = matrix[0]
                    sep = ["---"] * col_count
                    lines.append("| " + " | ".join(header) + " |")
                    lines.append("| " + " | ".join(sep) + " |")
                    for r in matrix[1:]:
                        lines.append("| " + " | ".join(r) + " |")

    summary = f"提取到段落 {para_count} 条，表格 {table_count} 个。"
    manual = []
    return "\n".join(lines) + "\n", summary, manual


def _xlsx_shared_strings(zf: zipfile.ZipFile) -> List[str]:
    ns = {"x": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
    if "xl/sharedStrings.xml" not in zf.namelist():
        return []
    root = ET.fromstring(zf.read("xl/sharedStrings.xml"))
    vals = [t.text or "" for t in root.findall(".//x:t", ns)]
    return vals


def extract_xlsx(path: Path) -> Tuple[str, str, List[str]]:
    ns = {
        "x": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
        "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    }
    with zipfile.ZipFile(path) as zf:
        shared = _xlsx_shared_strings(zf)
        wb_root = ET.fromstring(zf.read("xl/workbook.xml"))
        rel_root = ET.fromstring(zf.read("xl/_rels/workbook.xml.rels"))

        rel_map: Dict[str, str] = {}
        for rel in rel_root.findall(".//{http://schemas.openxmlformats.org/package/2006/relationships}Relationship"):
            rel_map[rel.attrib.get("Id", "")] = rel.attrib.get("Target", "")

        lines: List[str] = ["## 提取内容（Workbook / Sheets）", ""]
        sheet_count = 0
        non_empty_rows = 0

        for sheet in wb_root.findall(".//x:sheets/x:sheet", ns):
            sheet_count += 1
            name = sheet.attrib.get("name", f"Sheet{sheet_count}")
            rid = sheet.attrib.get("{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id", "")
            target = rel_map.get(rid, "")
            target = target.lstrip("/")
            if not target.startswith("xl/"):
                target = f"xl/{target}"

            lines.append(f"### Sheet: {name}")
            if target not in zf.namelist():
                lines.append("- 无法定位该 sheet 对应 XML（待人工补充）")
                lines.append("")
                continue

            ws_root = ET.fromstring(zf.read(target))
            rows = ws_root.findall(".//x:sheetData/x:row", ns)
            matrix: List[List[str]] = []
            max_cols = 0

            for row in rows:
                row_vals: List[str] = []
                for c in row.findall("x:c", ns):
                    ctype = c.attrib.get("t")
                    v = c.find("x:v", ns)
                    is_node = c.find("x:is", ns)
                    text = ""
                    if ctype == "s" and v is not None and v.text and v.text.isdigit():
                        idx = int(v.text)
                        text = shared[idx] if idx < len(shared) else ""
                    elif ctype == "inlineStr" and is_node is not None:
                        tnode = is_node.find(".//x:t", ns)
                        text = tnode.text if tnode is not None and tnode.text else ""
                    elif v is not None and v.text:
                        text = v.text
                    row_vals.append((text or "").strip())

                if any(row_vals):
                    non_empty_rows += 1
                    matrix.append(row_vals)
                    max_cols = max(max_cols, len(row_vals))

            if not matrix:
                lines.append("- 该 sheet 无可提取文本或仅含空值。")
                lines.append("")
                continue

            for r in matrix:
                if len(r) < max_cols:
                    r.extend([""] * (max_cols - len(r)))

            header = matrix[0]
            lines.append("| " + " | ".join(header) + " |")
            lines.append("| " + " | ".join(["---"] * max_cols) + " |")
            for r in matrix[1:]:
                lines.append("| " + " | ".join(r) + " |")
            lines.append("")

    summary = f"提取到 {sheet_count} 个 sheet，非空行 {non_empty_rows} 行。"
    manual = []
    return "\n".join(lines) + "\n", summary, manual


def extract_pptx(path: Path) -> Tuple[str, str, List[str]]:
    ns = {
        "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
        "p": "http://schemas.openxmlformats.org/presentationml/2006/main",
    }
    lines: List[str] = ["## 提取内容（Slides）", ""]
    manual: List[str] = []

    with zipfile.ZipFile(path) as zf:
        slides = sorted(
            [n for n in zf.namelist() if n.startswith("ppt/slides/slide") and n.endswith(".xml")],
            key=lambda x: int(re.search(r"slide(\d+)\.xml$", x).group(1)) if re.search(r"slide(\d+)\.xml$", x) else 0,
        )
        for slide_xml in slides:
            idx_match = re.search(r"slide(\d+)\.xml$", slide_xml)
            slide_no = idx_match.group(1) if idx_match else "?"
            root = ET.fromstring(zf.read(slide_xml))

            texts = [t.text.strip() for t in root.findall(".//a:t", ns) if t.text and t.text.strip()]
            title = texts[0] if texts else "（未识别到标题）"

            lines.append(f"### Slide {slide_no}")
            lines.append(f"- 标题（推断）：{title}")

            if texts:
                lines.append("- 正文文本：")
                for t in texts:
                    lines.append(f"  - {t}")
            else:
                lines.append("- 正文文本：未识别到文本内容")

            notes_xml = f"ppt/notesSlides/notesSlide{slide_no}.xml"
            if notes_xml in zf.namelist():
                nroot = ET.fromstring(zf.read(notes_xml))
                ntexts = [t.text.strip() for t in nroot.findall(".//a:t", ns) if t.text and t.text.strip()]
                if ntexts:
                    lines.append("- 备注信息：")
                    for t in ntexts:
                        lines.append(f"  - {t}")
                else:
                    lines.append("- 备注信息：存在 notesSlide，但未识别到文本")
                    manual.append(f"Slide {slide_no} 备注页存在但无可提取文本，需人工确认是否为图形化备注。")
            else:
                lines.append("- 备注信息：无法读取备注或备注不存在（需人工确认）")
                manual.append(f"Slide {slide_no} 未检测到 notesSlide，需人工确认是否存在口播备注。")
            lines.append("")

    summary = f"提取到 {len(slides)} 页 slide 文本。"
    return "\n".join(lines) + "\n", summary, manual


def extract_pdf(path: Path) -> Tuple[str, str, List[str], str]:
    lines = ["## 提取内容（PDF）", ""]
    manual: List[str] = []

    try:
        import pypdf  # type: ignore

        reader = pypdf.PdfReader(str(path))
        lines.append(f"- 页数：{len(reader.pages)}")
        lines.append("")
        extracted_pages = 0
        for i, page in enumerate(reader.pages, start=1):
            txt = (page.extract_text() or "").strip()
            if txt:
                extracted_pages += 1
                lines.append(f"### Page {i}")
                lines.append(txt)
                lines.append("")

        if extracted_pages == 0:
            status = "部分成功"
            summary = "读取 PDF 成功，但未提取到可用文本（可能为扫描件或轮廓字形）。"
            manual.append("无法从 PDF 提取文字，请人工补充关键规范条款。")
            lines.append("- 无法解析 PDF 文本，需人工补充。")
        else:
            status = "成功"
            summary = f"成功提取 {extracted_pages}/{len(reader.pages)} 页文本。"
        return "\n".join(lines) + "\n", summary, manual, status
    except Exception as e:
        status = "部分成功"
        summary = f"无法解析 PDF 文本：{e}"
        lines.append("- 无法解析 PDF 文本，需人工补充。")
        lines.append(f"- 原因：{e}")
        manual.append("PDF 文本未提取成功，请人工补充品牌规范关键条款（logo、字体、色彩、禁用规则）。")
        return "\n".join(lines) + "\n", summary, manual, status


def extract_image(path: Path) -> Tuple[str, str, List[str], str]:
    lines = [
        "## 图片文件记录（不做 OCR）",
        "",
        f"- 文件路径：`{path.as_posix()}`",
        f"- 文件名：`{path.name}`",
        "- 内容提取：未执行 OCR（按规则仅记录文件）",
        "- 用途：待确认",
        "- 人工补充说明：请补充该图片对应的业务用途、应提取文本与设计约束。",
        "",
    ]
    summary = "图片文件仅记录元信息，未做 OCR。"
    manual = ["请人工补充图片中的文字信息、图示含义与引用位置。"]
    return "\n".join(lines), summary, manual, "仅记录文件"


def process_file(source: Path, category: str, out_dir: Path) -> Record:
    file_type = guess_file_type(source)
    out_name = make_output_name(category, source)
    out_path = out_dir / out_name

    header = md_header(source, file_type)
    manual_questions: List[str] = []

    try:
        suffix = source.suffix.lower()
        if suffix == ".docx":
            body, summary, manual = extract_docx(source)
            status = "成功"
            manual_questions.extend(manual)
        elif suffix == ".xlsx":
            body, summary, manual = extract_xlsx(source)
            status = "成功"
            manual_questions.extend(manual)
        elif suffix == ".pptx":
            body, summary, manual = extract_pptx(source)
            status = "部分成功" if manual else "成功"
            manual_questions.extend(manual)
        elif suffix == ".pdf":
            body, summary, manual, status = extract_pdf(source)
            manual_questions.extend(manual)
        elif suffix in {".png", ".jpg", ".jpeg"}:
            body, summary, manual, status = extract_image(source)
            manual_questions.extend(manual)
        else:
            status = "失败"
            summary = "不支持的文件类型，未提取正文。"
            body = (
                "## 读取结果\n\n"
                "- 读取状态：失败\n"
                "- 原因：不支持的文件类型\n"
                "- 需人工补充：请人工提取关键内容并补录。\n"
            )
            manual_questions.append("不支持的文件类型，请人工提取并补录。")

    except Exception as e:
        status = "失败"
        summary = f"读取失败：{e}"
        body = (
            "## 读取结果\n\n"
            "- 读取状态：失败\n"
            f"- 原因：{e}\n"
            "- 需人工补充：请人工提取关键内容并补录。\n\n"
            "```text\n"
            f"{traceback.format_exc()}\n"
            "```\n"
        )
        manual_questions.append("文件读取失败，请人工确认文件完整性并补录。")

    write_markdown(out_path, header + body)

    return Record(
        source_path=source,
        category=category,
        file_type=file_type,
        output_path=out_path,
        status=status,
        summary=summary,
        manual_questions=manual_questions,
    )


def build_manual_template(path: Path) -> None:
    content = """# 人工补充模板（Manual Notes Template）

> 用于补充 PDF / 图片 / 解析失败文件中的关键信息。

## 1. 基本信息
- 源文件路径：
- 对应提取文件（Markdown）：
- 补充人：
- 补充日期：

## 2. 需补充内容
- 关键文本摘录：
- 关键表格/图示说明：
- 与需求解析相关的约束信息：
- 与叙事结构相关的信息：
- 与视觉策略/系统相关的信息：

## 3. 可靠性标记
- 信息来源类型：原文件截图 / 口头确认 / 邮件 / 会议纪要 / 其他
- 是否已二次复核：是 / 否
- 复核人：

## 4. 待确认问题
- P0：
- P1：
- P2：
"""
    write_markdown(path, content)


def build_index(path: Path, records: List[Record]) -> None:
    lines = [
        "# 输入资料提取索引（Extraction Index）",
        "",
        f"- 生成时间：{dt.datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}",
        f"- 总文件数：{len(records)}",
        "",
        "| 源文件路径 | 文件类型 | 输出 Markdown 路径 | 读取状态 | 主要内容摘要 | 需要人工补充的问题 |",
        "|---|---|---|---|---|---|",
    ]

    for r in records:
        questions = "；".join(r.manual_questions) if r.manual_questions else "无"
        lines.append(
            "| "
            + f"`{r.source_path.as_posix()}` | `{r.file_type}` | `{r.output_path.as_posix()}` | {r.status} | {r.summary} | {questions} |"
        )

    lines.append("")
    lines.append("## 状态统计")
    status_count: Dict[str, int] = {}
    for r in records:
        status_count[r.status] = status_count.get(r.status, 0) + 1
    for k, v in sorted(status_count.items(), key=lambda kv: kv[0]):
        lines.append(f"- {k}：{v}")

    write_markdown(path, "\n".join(lines) + "\n")


def collect_sources(base: Path) -> List[Tuple[str, Path]]:
    mapping = [
        ("briefs", base / "input/briefs/private"),
        ("brand-assets", base / "input/brand-assets/private"),
        ("references", base / "input/references/private"),
    ]
    files: List[Tuple[str, Path]] = []
    for category, directory in mapping:
        if not directory.exists():
            continue
        for p in sorted(directory.iterdir()):
            if p.is_file():
                files.append((category, p))
    return files


def main() -> int:
    parser = argparse.ArgumentParser(description="Extract private input files to markdown under input/extracted")
    parser.add_argument("--root", default=str(ROOT), help="Repository root path")
    args = parser.parse_args()

    root = Path(args.root).resolve()
    out_dir = root / "input/extracted"
    out_dir.mkdir(parents=True, exist_ok=True)

    records: List[Record] = []
    for category, source in collect_sources(root):
        rec = process_file(source, category, out_dir)
        records.append(rec)

    build_index(out_dir / "_extraction_index.md", records)
    build_manual_template(out_dir / "_manual_notes_template.md")

    print(f"[DONE] extracted {len(records)} files to {out_dir.as_posix()}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
