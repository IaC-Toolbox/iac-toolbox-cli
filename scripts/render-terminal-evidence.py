from pathlib import Path
import re
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parent.parent
out_txt = root / 'docs/evidence/terminal-run.txt'
out_png = root / 'docs/evidence/terminal-run.png'
text = out_txt.read_text(errors='ignore')
text = re.sub(r'\x1b\[[0-9;?]*[ -/]*[@-~]', '', text).replace('\r', '')
lines = [line for line in text.splitlines() if line.strip()][:40]
if not lines:
    lines = ['No terminal output captured.']
font = ImageFont.load_default()
line_h = 16
width = 1100
height = max(160, 40 + line_h * (len(lines) + 2))
img = Image.new('RGB', (width, height), (12, 10, 9))
draw = ImageDraw.Draw(img)
draw.text((16, 12), 'iac-toolbox-cli terminal evidence', fill=(168, 85, 247), font=font)
y = 40
for line in lines:
    draw.text((16, y), line[:160], fill=(245, 245, 245), font=font)
    y += line_h
img.save(out_png)
