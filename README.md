# 清明上河图 · 虹桥夜渡 — Pixel-Art Gaussian Splatting

复现 Silicon Jungle（@JungleSilicon）公开的 **Pixel-Art Gaussian Splatting** 效果：
不用三角面片建模，用解析曲面 / SDF 做表面采样生成高斯泼溅（Gaussian Splats），
再用低分辨率 + 有限色板 + 抖动的 Pixel-Art Resolve 输出可以旋转、变形的 3D 像素艺术。

题材取《清明上河图》最有名的虹桥段，改成夜景：汴河、虹桥、两岸灯火、
一艘大船顺流而下，**到桥洞前收帆、压低通过、过桥后重新扬帆**，外加月光、雾气与水面倒影。

## 两个可运行版本

| 版本 | 文件 | 怎么跑 | 状态 |
|---|---|---|---|
| 动态版（主交付） | `web/index.html` | 浏览器直接打开，零依赖单文件 | ✅ 已实测：约 13.4 万 splats（WebGL2 GPU 点精灵+深度缓冲），26 秒循环，放桅过桥/雾/倒影/桥上人群/拖动环视/像素化开关，日景·夜景双主题（夜景月亮为球体法线着色） |
| Ink Studio 原生版 | `scenes/qingming-night.js` | 用上游 CLI 渲染 PNG | ✅ 已实测出图 `out/qingming.png`（900×620），关键帧：船在桥右、帆半收 |

上游项目：[siliconjungle/shapeshift-labs-ink-studio](https://github.com/siliconjungle/shapeshift-labs-ink-studio)（MIT，2026-11-16 建仓）

## 快速开始

```bash
# 动态版
open web/index.html        # 或 python3 -m http.server 后访问

# 原生版（需要上游仓库）
git clone https://github.com/siliconjungle/shapeshift-labs-ink-studio /tmp/ink-studio
node /tmp/ink-studio/cli/ink-studio.js render scenes/qingming-night.js --t 0 --out out/qingming.png
node /tmp/ink-studio/cli/ink-studio.js stats scenes/qingming-night.js
```

## 管线（两版同构）

1. **SDF / 解析曲面建模** — 盒、椭球、圆柱、拱环、平面，全用数学函数描述（`S.box / S.ball / S.tube` 或 web 版同名采样器）。
2. **Surface Sampling** — 沿表面按法线采样，生成带位置/法线/颜色/尺寸的高斯点；平坦区稀、曲面与轮廓密。
3. **Gaussian Splat Rendering** — 每帧深度排序、投影成椭圆泼溅、按月光方向做明暗、自发光点（灯笼/月）不吃光照。
4. **Pixel-Art Resolve** — 640×360 逻辑分辨率渲染 → 色板量化（24 阶）→ 棋盘抖动 → 最近邻放大。关掉这层（页面按钮）能直接看到泼溅原始的柔和样子，便于做消融对比。

## 动画设计（动态版，26 秒循环）

- 船：x 从 -9.5 到 9.5 顺流；`sailFactor(x)` 同时控制收帆与放桅：|x|>3.4 桅杆直立满帆 → 接近桥洞帆卷到桅上、桅杆绕桅座朝船尾放倒约 58°（横桁改为与桅杆并拢的帆桁束，避免穿模） → 桥下保持 → 出桥立桅扬帆；船身随波上下浮动。虹桥按原画与参考图为朱红木拱（五道拱肋+栏杆+桥上看船人群），只有桥墩是石的；船上是竹编大舱、货筐与三名船工（船头拉绳、舱顶扶桅、船尾撑篙）。
- 雾：64 个大尺寸低透明度泼溅粒子沿河面漂移（世界空间，非屏幕贴图）。
- 倒影：月、桥灯、船头/船尾灯在水面生成镜像拉伸条纹，带正弦摆动；水面 splat 本身带 shimmer。
- 桥上行人：3 个提灯行人沿桥面弧线往返。
- 灯火：自发光 splat 按各自相位闪烁。

## 目录

```
scenes/qingming-night.js   Ink Studio 原生场景
web/index.html             动态版（单文件，零依赖）
docs/TECH.md               技术拆解、与 Mesh/Voxel/Ray Marching 对比、待验证清单
CURSOR_TASK.md             给 Cursor 的续作任务书（目标、验收标准、红线）
.cursor/rules/project.mdc  Cursor 项目规则
tools/render-upstream.sh   一键渲染原生版
out/                       实测产出（原生 PNG + 动态版三帧截图）
```

## 已知短板（别当成已解决）

- 动态版已迁 WebGL2（GPU 点精灵+深度缓冲，640×360 低分渲染后调色板量化 Resolve 放大），约 12 万点；WebGL2 不可用时自动回退 Canvas 2D 画家算法。构图为近景：虹桥横贯画面、船在前景过桥洞，向 Silicon Jungle 工具链上社区作品（如 @c02680900 的河畔咖啡馆）的精致度看齐——小场景、高密度、逐点色抖动质感、日夜双主题。v0.5 按用户给的白天近景参考图做构图 1:1 对齐：低机位、桥上约 49 人、前景粉花丛+柳冠+屋顶遮挡层、茶楼茶旗、远处小船、垂落帆布与水花尾迹；参考图本身是照片级渲染（景深/人脸/布料褶皱），像素泼溅管线只能对齐构图与元素、无法复刻其微观细节，此边界已如实告知用户。
- 动态版没有做深度轮廓描边（Selective Ink）和像素稳定性处理，镜头拖动时会有轻微闪烁——这是 CURSOR_TASK 里的第一优先级。
- 同场景 Mesh / Ray Marching / Splat 三路线的画质-性能消融对照还没做，结论别写死（见 docs/TECH.md）。

## 许可

本项目代码 MIT。上游 Ink Studio 为 MIT，保留其 LICENSE 与出处链接即可。
《清明上河图》为公版古画，本项目未使用任何受版权保护的现代素材或图片。

## Three.js 程序化建模版（three/）

`three/index.html` — 全部几何由代码生成的 Three.js 场景（three.min.js r128 随仓分发，无构建步骤）：

- **虹桥**：参数化编木拱——5 道弧肋 TubeGeometry + 横档 + 台阶桥面 + 双层栏杆，桥上约 46 名低模人物（倚栏/孩童比例）
- **船**：横截面放样（Loft）船体 + 竹席纹理舱房（发光格栅窗）+ 货筐绳圈；**桅杆枢轴机关**——桅杆装在独立 Group 上，角度与船位联动：近桥向船尾放倒 76°、帆同步收卷成束，过桥后立起张帆
- **质感**：木纹/瓦面/石墙/竹席/帆布/水面全部 Canvas 程序化纹理；暖色太阳光 + PCF 软阴影 + ACES 色调映射；**移轴景深后期**（渲染目标 + 自定义模糊 shader，焦点带外渐进虚化出微缩感）
- 26 秒循环，底部可暂停/拖动进度；URL 参数 `?t=秒数` 定格、`?post=0` 关后期

在线：https://h1bomb.github.io/qingming-pixel-splat/three/
