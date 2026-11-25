"""Words of each consent form, for portal block 204 (forms shown as on-screen pages with the Tulasi header).
python -I tools/build_forms_text.py (in tulasi-portal-vercel)  ->  public/legacy/data/forms-text.json
{form id: {page number: [[x0, y0, x1, y1, text, bold(0/1), size], ...]}} in PDF points, same space as CDF_FORMS fields
(before any crop: block 204 applies the crops the portal applies to the page images)."""
import os, json, fitz

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
ROOT = os.path.dirname(REPO)   # hms-v1, which holds documents/pdf
SRC = os.path.join(ROOT, 'documents', 'pdf')
OUT = os.path.join(REPO, 'public', 'legacy', 'data', 'forms-text.json')
FORMS = {
    'ADMISSION CONSENT': 'admission-consent', 'HIGH RISK INFORMED CONSENT': 'high-risk-consent', 'FORM C': 'form-c',
    'FORM E': 'form-e', 'RE-ASSESMENT FORM': 'reassessment', 'OUTING CONSENT': 'outing-consent', 'LAMA CONSENT': 'lama-consent',
    'REFERRAL CONSULTATION CONSENT': 'referral-consultation', 'CLOZAPINE CONSENT': 'clozapine-consent', 'MECT FINAL': 'mect-final',
    'DISCHARGE CONSENT': 'discharge-consent',
}
APP = os.path.join(REPO, 'public', 'forms', 'admission-application', 'application-form.pdf')


def page_words(page):
    spans = []
    for b in page.get_text('dict')['blocks']:
        for l in b.get('lines', []):
            for s in l['spans']:
                if s['text'].strip():
                    spans.append((fitz.Rect(s['bbox']), bool(s['flags'] & 16) or 'bold' in s['font'].lower(), s['size']))
    out = []
    for w in page.get_text('words'):
        r = fitz.Rect(w[:4]); c = fitz.Point((r.x0 + r.x1) / 2, (r.y0 + r.y1) / 2)
        sp = next((s for s in spans if s[0].contains(c)), None)
        out.append([round(r.x0, 1), round(r.y0, 1), round(r.x1, 1), round(r.y1, 1), w[4],
                    1 if sp and sp[1] else 0, round(sp[2], 1) if sp else 10])
    return out


def main():
    res = {}
    for name, fid in FORMS.items():
        doc = fitz.open(os.path.join(SRC, name + '.pdf'))
        res[fid] = {str(i + 1): page_words(p) for i, p in enumerate(doc)}
    doc = fitz.open(APP)   # admission terms = pages 3 to 8 of the application form
    res['adm-terms'] = {str(i + 1): page_words(doc[i]) for i in range(2, min(8, len(doc)))}
    # the same edits the portal made to the page images (blocks 192, 196): crops, cut pages, renamed labels
    crop = {1: [41.5, 760.7], 2: [18, 747.7], 3: [18, 783.7], 4: [55.5, 654.8], 5: [563.8, 256.4], 6: [18, 38.5],
            7: [18, 780.2], 8: [18, 814.2], 9: [18, 794.2], 10: [18, 426.9]}
    for p, ws in res['mect-final'].items():
        c = crop.get(int(p))
        if c:
            res['mect-final'][p] = [[w[0], round(w[1] - c[0], 1), w[2], round(w[3] - c[0], 1)] + w[4:] for w in ws
                                    if w[1] >= c[0] and w[3] - c[0] <= c[1]]
    res['outing-consent'] = {'1': [w for w in res['outing-consent']['1'] if w[3] <= 600]}
    del res['adm-terms']['3']
    res['adm-terms']['8'] = [w for w in res['adm-terms']['8'] if w[3] <= 649.9]
    dc = []
    for w in res['discharge-consent']['1']:
        if 145 < w[1] < 160: continue                      # Place of outing / IP No. row removed
        if w[4] == 'OUTING': w[4] = 'DISCHARGE'
        if 110 < w[1] < 125 and w[4] == 'IP': w[4] = 'UHID'
        if 110 < w[1] < 125 and w[4] == 'no.': continue
        if 160 < w[1] < 205: w[1] = round(w[1] - 18.5, 1); w[3] = round(w[3] - 18.5, 1)
        dc.append(w)
    res['discharge-consent']['1'] = dc
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(res, f, ensure_ascii=False, separators=(',', ':'))
    print({k: sum(len(v) for v in p.values()) for k, p in res.items()}, os.path.getsize(OUT))


if __name__ == '__main__':
    main()
