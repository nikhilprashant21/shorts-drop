"""Add or update a row in Shorts Tracker.xlsx without loading any spreadsheet skill.

Add a new video (inserted above the "Total posted" row, formatting copied from the row above):
    python3 tracker_add.py "Shorts Tracker.xlsx" add 25 "How a gearbox works (beat explainer)" "25 - How a gearbox works" 47.5 [--note "25 ... not posted yet."]

Mark a video as posted:
    python3 tracker_add.py "Shorts Tracker.xlsx" post 25 instagram https://www.instagram.com/reel/XXXX/
    (platform: instagram | youtube | facebook; facebook has no link column)

Keeps the ✓/☐ dropdown, the green/grey colouring and the COUNTIF totals covering every row.
"""
import sys
from copy import copy
from openpyxl import load_workbook
from openpyxl.formatting.formatting import ConditionalFormattingList

COLS = {'instagram': ('E', 'H'), 'youtube': ('F', 'I'), 'facebook': ('G', None)}


def find_total(ws):
    for r in range(1, ws.max_row + 1):
        if ws.cell(r, 2).value == 'Total posted':
            return r
    raise SystemExit('No "Total posted" row found')


def find_row(ws, num, total):
    for r in range(5, total):
        if ws.cell(r, 1).value == num:
            return r
    raise SystemExit(f'Video {num} not found in the tracker')


def main():
    path, cmd = sys.argv[1], sys.argv[2]
    wb = load_workbook(path)
    ws = wb.active
    total = find_total(ws)
    if cmd == 'add':
        num, title, folder, length = int(sys.argv[3]), sys.argv[4], sys.argv[5], float(sys.argv[6])
        note = sys.argv[sys.argv.index('--note') + 1] if '--note' in sys.argv else None
        ws.insert_rows(total)  # new empty row where the totals were; totals move down one
        new, total = total, total + 1
        for c in range(1, 10):
            src = ws.cell(new - 1, c)
            ws.cell(new, c)._style = copy(src._style)
        for c, v in zip(range(1, 10), [num, title, folder, length, '☐', '☐', '☐', None, None]):
            ws.cell(new, c).value = v
        last = total - 1
        for col in 'EFG':
            ws[f'{col}{total}'] = f'=COUNTIF({col}5:{col}{last},"✓")&" / "&COUNTA({col}5:{col}{last})'
        dv = ws.data_validations.dataValidation[0]
        for col in 'EFG':
            dv.add(f'{col}{new}')
        rules = [r for cf in ws.conditional_formatting for r in cf.rules]
        ws.conditional_formatting = ConditionalFormattingList()
        for rule in rules:
            ws.conditional_formatting.add(f'E5:G{last}', rule)
        if note:
            for r in range(total + 1, ws.max_row + 1):
                v = ws.cell(r, 2).value
                if isinstance(v, str) and v.startswith('Note:'):
                    ws.cell(r, 2).value = v.rstrip() + ' ' + note
                    break
        print(f'added video {num} in row {new}; totals now in row {total}')
    elif cmd == 'post':
        num, platform = int(sys.argv[3]), sys.argv[4].lower()
        link = sys.argv[5] if len(sys.argv) > 5 else None
        r = find_row(ws, num, total)
        tick, linkcol = COLS[platform]
        ws[f'{tick}{r}'] = '✓'
        if link and linkcol:
            ws[f'{linkcol}{r}'] = link
        print(f'video {num}: {platform} ticked' + (f', link set' if link and linkcol else ''))
    else:
        raise SystemExit('command must be add or post')
    wb.save(path)


if __name__ == '__main__':
    main()
