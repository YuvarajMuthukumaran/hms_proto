"""Build public/legacy/data/icd11.json from Anu's "ICD 11 Matrix updated.xlsx" (25 Nov 2026).

Usage:  python -I tools/build_icd11.py "C:/Users/<you>/Downloads/ICD 11 Matrix updated.xlsx"

The workbook has no patient data: a symptom vocabulary (Symptom Codes) and, per ICD-11 code, the
symptom codes coloured by their role in the diagnosis (legend sheet). Roles:
  e essential (red), c characteristic (orange), s supporting (green), o onset/course (light blue),
  v severity/specifier (dark blue), d differentiator/rule-out (violet), h history (grey).
"""
import json, os, sys
import openpyxl

ROLE = {'00C00000': 'e', '00FFC000': 'c', '0000B050': 's', '0000B0F0': 'o',
        '000070C0': 'v', '007030A0': 'd', '00BFBFBF': 'h'}

def main(src):
    wb = openpyxl.load_workbook(src)
    sym = {}
    for r in wb['Symptom Codes'].iter_rows(min_row=1, values_only=True):
        if not r or r[1] is None or r[2] is None: continue
        code = str(r[1]).strip()
        if not code.isdigit(): continue
        sym[code.zfill(4)] = [str(r[0] or '').strip(), str(r[2]).strip()]
    dx = []
    ws = wb['Diagnostic Matrix']
    for row in ws.iter_rows(min_row=3):
        code = row[0].value; name = row[1].value
        if not code or not name: continue
        code = str(code).strip(); rule = str(row[2].value or '').strip()
        items = []
        for c in row[3:]:
            if c.value is None or str(c.value).strip() == '': continue
            k = str(c.value).strip()
            k = k.zfill(4) if k.isdigit() else k
            items.append([k, ROLE.get(c.fill.fgColor.rgb, 's')])
        dx.append({'c': code, 'n': str(name).strip(), 'r': rule, 's': items, 'g': 1 if (not items and not rule) else 0})
    out = os.path.join(os.path.dirname(__file__), '..', 'public', 'legacy', 'data', 'icd11.json')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with open(out, 'w', encoding='utf-8') as f:
        json.dump({'v': '25nov', 'sym': sym, 'dx': dx}, f, ensure_ascii=False, separators=(',', ':'))
    print('symptoms', len(sym), 'diagnoses', len([d for d in dx if not d['g']]), 'groups', len([d for d in dx if d['g']]))
    miss = {k for d in dx for k, _ in d['s'] if k not in sym}
    print('codes used but not in the vocabulary:', len(miss))

if __name__ == '__main__':
    main(sys.argv[1])
