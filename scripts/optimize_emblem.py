# -*- coding: utf-8 -*-
"""把官方校徽 JPG 处理成透明底 PNG：
- emblem_purple.png：保留原紫色，白底转透明（供浅色主题）
- emblem_white.png：纯白版（供深色主题）
白底按「暗度」抠除，保留抗锯齿边缘。
"""
import numpy as np
from PIL import Image

SRC = 'src/assets/emblem_new.jpg'
THRESH = 14      # 低于该暗度视为纯白底
SOFT = 60        # 软过渡区间，越大边缘越柔

img = Image.open(SRC).convert('RGB')
a = np.asarray(img).astype(np.float32)
dark = 255.0 - a.min(axis=2)          # 白色=0，紫色线条值大
alpha = np.clip((dark - THRESH) / SOFT, 0, 1)
alpha = (alpha * 255).astype(np.uint8)

def save(color_rgb, path, max_side):
    rgba = np.dstack([np.tile(np.array(color_rgb, np.uint8), a.shape[:2] + (1,)), alpha])
    out = Image.fromarray(rgba, 'RGBA')
    # 裁掉全透明边框
    bbox = out.getbbox()
    if bbox:
        out = out.crop(bbox)
    # 居中成正方形画布，保持比例
    w, h = out.size
    side = max(w, h)
    canvas = Image.new('RGBA', (side, side), (0, 0, 0, 0))
    canvas.paste(out, ((side - w) // 2, (side - h) // 2))
    canvas = canvas.resize((max_side, max_side), Image.LANCZOS)
    canvas.save(path)
    print(path, canvas.size)

save((117, 38, 129), 'src/assets/emblem_purple.png', 512)
save((255, 255, 255), 'src/assets/emblem_white.png', 256)
