# -*- coding: utf-8 -*-
"""用 440px 高清校徽源图重新生成透明底校徽。
按亮度抠图（校徽深紫线 vs 浅粉底），水印为浅灰字（亮度≈底），
再手动遮掉左下水印矩形区，双保险。
"""
import numpy as np
from PIL import Image

SRC = 'src/assets/emblem_correct_src.jpg'

img = Image.open(SRC).convert('RGB')
a = np.asarray(img).astype(np.float32)
lum = a.mean(axis=2)

alpha = np.clip((242 - lum) / 55, 0, 1)
# 遮掉左下角水印区（位于校徽圆环外）
alpha[403:, :85] = 0
alpha = (alpha * 255).astype(np.uint8)

def save(color_rgb, path, max_side):
    rgba = np.dstack([np.tile(np.array(color_rgb, np.uint8), a.shape[:2] + (1,)), alpha])
    out = Image.fromarray(rgba, 'RGBA')
    bbox = out.getbbox()
    if bbox:
        out = out.crop(bbox)
    w, h = out.size
    side = max(w, h)
    canvas = Image.new('RGBA', (side, side), (0, 0, 0, 0))
    canvas.paste(out, ((side - w) // 2, (side - h) // 2))
    canvas = canvas.resize((max_side, max_side), Image.LANCZOS)
    canvas.save(path)
    print(path, canvas.size)

save((117, 38, 129), 'src/assets/emblem_purple.png', 512)
save((255, 255, 255), 'src/assets/emblem_white.png', 256)
