# -*- coding: utf-8 -*-
"""从学校横版组合标(school_lockup.png)中裁出校徽部分，抠白底，
生成 emblem_purple.png（浅色主题）与 emblem_white.png（深色主题）。
"""
import numpy as np
from PIL import Image

SRC = 'src/assets/school_lockup.png'
THRESH = 12
SOFT = 50

img = Image.open(SRC).convert('RGB')
print('lockup size:', img.size)

# 校徽位于组合标左侧（已定位：x 112-258, y 312-458），直接精裁
crop = img.crop((112, 312, 258, 458))
a = np.asarray(crop).astype(np.float32)

dark = 255.0 - a.min(axis=2)
ys, xs = np.where(dark > 40)
print('emblem bbox in crop:', xs.min(), ys.min(), xs.max(), ys.max())
pad = 6
x0, y0 = max(xs.min() - pad, 0), max(ys.min() - pad, 0)
x1, y1 = min(xs.max() + pad, a.shape[1]), min(ys.max() + pad, a.shape[0])
sub = a[y0:y1, x0:x1]

# 抠白底（暗度转 alpha）
dark2 = 255.0 - sub.min(axis=2)
alpha = np.clip((dark2 - THRESH) / SOFT, 0, 1)
alpha = (alpha * 255).astype(np.uint8)

def save(color_rgb, path, max_side):
    rgba = np.dstack([np.tile(np.array(color_rgb, np.uint8), sub.shape[:2] + (1,)), alpha])
    out = Image.fromarray(rgba, 'RGBA')
    w, h = out.size
    side = max(w, h)
    canvas = Image.new('RGBA', (side, side), (0, 0, 0, 0))
    canvas.paste(out, ((side - w) // 2, (side - h) // 2))
    canvas = canvas.resize((max_side, max_side), Image.LANCZOS)
    canvas.save(path)
    print(path, canvas.size)

save((117, 38, 129), 'src/assets/emblem_purple.png', 512)
save((255, 255, 255), 'src/assets/emblem_white.png', 256)
