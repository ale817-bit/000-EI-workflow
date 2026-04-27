#!/usr/bin/env node

const { spawnSync } = require('child_process');
const path = require('path');

const root = path.resolve(__dirname, '..');

const py = String.raw`
import re, zipfile, mimetypes
from pathlib import Path
from xml.etree import ElementTree as ET

root = Path(r"${root}")
raw_map = {
    'briefs': root / 'input/raw/briefs',
    'brand-assets': root / 'input/raw/brand-assets',
    'references': root / 'input/raw/references',
}
norm_root = root / 'input/normalized'
for p in [norm_root/'briefs', norm_root/'brand-assets', norm_root/'references', norm_root/'images']:
    p.mkdir(parents=True, exist_ok=True)

def safe_name(name):
    name = name.replace('/', '_').replace('\\', '_')
    for ch in '<>:"|?*':
        name = name.replace(ch, '_')
    name = re.sub(r'\s+', ' ', name).strip()
    return name

def md_header(src, status, ftype):
    return '\n'.join([
        '# 输入标准化结果',
        '',
        '- 源文件: ' + src.as_posix(),
        '- 文件类型: ' + ftype,
        '- 读取状态: ' + status,
        ''
    ]) + '\n'

def extract_docx(p):
    ns={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    with zipfile.ZipFile(p) as z:
        xml=z.read('word/document.xml')
    r=ET.fromstring(xml)
    ts=[t.text for t in r.findall('.//w:t', ns) if t.text]
    return '\n'.join(['- '+t for t in ts[:400]]) or '- 未提取到文本'

def extract_xlsx(p):
    ns={'x':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
    out=['## Workbook 内容']
    with zipfile.ZipFile(p) as z:
        shared=[]
        if 'xl/sharedStrings.xml' in z.namelist():
            sx=ET.fromstring(z.read('xl/sharedStrings.xml'))
            shared=[t.text or '' for t in sx.findall('.//x:t', ns)]
        wb=ET.fromstring(z.read('xl/workbook.xml'))
        rel=ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))
        rid_map={r.attrib.get('Id',''): r.attrib.get('Target','') for r in rel}
        for s in wb.findall('.//x:sheets/x:sheet', ns):
            name=s.attrib.get('name','Sheet')
            rid=s.attrib.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id','')
            target=rid_map.get(rid,'').lstrip('/')
            if not target.startswith('xl/'): target='xl/'+target
            out.append('\n### Sheet: '+name)
            if target not in z.namelist():
                out.append('- 需人工补充：无法定位 sheet XML')
                continue
            ws=ET.fromstring(z.read(target))
            rows=ws.findall('.//x:sheetData/x:row', ns)
            c=0
            for row in rows:
                vals=[]
                for cell in row.findall('x:c', ns):
                    t=cell.attrib.get('t')
                    v=cell.find('x:v', ns)
                    txt=''
                    if t=='s' and v is not None and v.text and v.text.isdigit():
                        idx=int(v.text)
                        txt=shared[idx] if idx < len(shared) else ''
                    elif v is not None and v.text:
                        txt=v.text
                    if txt.strip(): vals.append(txt.strip())
                if vals:
                    out.append('- ' + ' | '.join(vals))
                    c += 1
                    if c >= 200:
                        out.append('- ...（已截断）')
                        break
    return '\n'.join(out)

def extract_pptx(p):
    ns={'a':'http://schemas.openxmlformats.org/drawingml/2006/main'}
    out=['## Slides 内容']
    with zipfile.ZipFile(p) as z:
        slides=sorted([n for n in z.namelist() if n.startswith('ppt/slides/slide') and n.endswith('.xml')])
        for s in slides:
            m=re.search(r'slide(\d+)\.xml$', s)
            no=m.group(1) if m else '?'
            r=ET.fromstring(z.read(s))
            ts=[t.text.strip() for t in r.findall('.//a:t', ns) if t.text and t.text.strip()]
            out.append('\n### Slide '+no)
            if ts:
                out.extend(['- '+t for t in ts[:80]])
            else:
                out.append('- 未提取到文本')
    return '\n'.join(out)

def extract_pdf(p):
    try:
        import pypdf
        r=pypdf.PdfReader(str(p))
        out=['## PDF 文本提取']
        got=0
        for i,page in enumerate(r.pages, start=1):
            t=(page.extract_text() or '').strip()
            if t:
                out.append('\n### Page '+str(i)+'\n'+t[:2000])
                got += 1
        if got == 0: out.append('- 需人工补充：未提取到可用文本')
        return '\n'.join(out), ('部分成功' if got == 0 else '成功')
    except Exception as e:
        return '## PDF 文本提取\n\n- 需人工补充：无法解析 PDF 文本\n- 原因：'+str(e), '部分成功'

records=[]
for cat, d in raw_map.items():
    if not d.exists():
        continue
    for f in sorted(d.iterdir()):
        if (not f.is_file()) or f.name.startswith('.'):
            continue
        ext=f.suffix.lower()
        mime,_=mimetypes.guess_type(f.name)
        ftype=mime or ext or 'unknown'
        status='成功'
        body=''
        out_dir=norm_root / cat
        try:
            if ext=='.docx':
                body='## DOCX 文本\n\n'+extract_docx(f)
            elif ext=='.xlsx':
                body=extract_xlsx(f)
            elif ext=='.pptx':
                body=extract_pptx(f)
            elif ext=='.pdf':
                body,status=extract_pdf(f)
            elif ext in {'.png','.jpg','.jpeg','.webp','.ai','.psd'}:
                status='仅记录文件'
                out_dir=norm_root / 'images'
                body='## 文件说明（不做 OCR）\n\n- 文件名：'+f.name+'\n- 原始路径：'+f.as_posix()+'\n- 需人工补充：请在 input/manual-notes/ 记录关键内容与用途'
            else:
                status='失败'
                body='## 读取失败\n\n- 需人工补充：不支持的文件类型'
        except Exception as e:
            status='失败'
            body='## 读取失败\n\n- 需人工补充：'+str(e)

        out_name = cat + '__' + safe_name(f.name) + '.md'
        out_path = out_dir / out_name
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(md_header(f,status,ftype)+body+'\n', encoding='utf-8')
        records.append((f.as_posix(), ftype, out_path.as_posix(), status))

lines=['# Normalized Input Index','', '| 源文件 | 文件类型 | 输出文件 | 状态 |','|---|---|---|---|']
for src,typ,outp,st in records:
    lines.append('| '+src+' | '+typ+' | '+outp+' | '+st+' |')
(norm_root/'_index.md').write_text('\n'.join(lines)+'\n', encoding='utf-8')
print('[DONE] normalized files:', len(records))
`;

const res = spawnSync('python3', ['-c', py], { stdio: 'inherit' });
if (res.status !== 0) process.exit(res.status || 1);
