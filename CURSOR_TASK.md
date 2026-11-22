# 给 Cursor 的续作任务书：虹桥夜渡 v2

## 背景（先读完再动手）
- README.md 是项目总览；docs/TECH.md 是技术拆解与待验证清单。
- 现有两条线：`web/index.html`（动态版，Canvas 2D CPU 泼溅，零依赖单文件，已可跑）
  和 `scenes/qingming-night.js`（Ink Studio 上游原生场景，CLI 可渲染 PNG）。
- 上游仓库：https://github.com/siliconjungle/shapeshift-labs-ink-studio （MIT，Node ≥18，零运行时依赖）。
  本地调试原生版：`node <upstream>/cli/ink-studio.js render scenes/qingming-night.js --t 0 --out out/qingming.png`

## 目标（按优先级）
1. **WebGL2 渲染器**：把动态版的泼溅绘制从 Canvas 2D 迁到 WebGL2（参考上游 docs/browser-renderer.md 与 webgl.mjs），
   splat 数量从 ~1.3 万提到 ≥5 万，帧率 ≥50fps（M 芯片 Mac，480×270 逻辑分辨率）。
2. **Selective Ink 描边**：用深度/法线边缘检测给轮廓、折角、材质边界加深色描边（上游 docs/edge-filter.md、docs/art-passes.md）。
3. **像素稳定性**：镜头慢速环视时像素不闪烁——世界空间抖动 + 稳定采样（上游 docs/stable-dithering.md、docs/art-stability.md）。
4. **消融对照模式**：同一场景一键切换 Splat / Mesh（three.js 或原生 WebGL）两条渲染路线，共用同一套 Pixel Resolve，
   页面上并排显示帧率与 splat/三角形计数。这是回答「为什么非要 Splat」这个质疑的实验，不许预设结论。
5. **场景加密**（有余力再做）：桥下纤夫、第二艘小船对向行驶、岸边酒楼二层灯笼阵列、远景城门轮廓。

## 验收标准
- `web/index.html` 仍可单文件打开运行（WebGL2 代码可内联；不许引入需要构建步骤的依赖）。
- 收帆过桥的时间轴行为不变：满帆 → 收至 16% → 桥下保持 → 出桥扬帆；拖动环视、雾/倒影开关、像素化开关都保留。
- 每项改动后跑一遍：页面无 console error；用截图对比改动前后各 3 个时刻（扬帆/收帆中/桥下）。
- 原生版场景改动后必须用上游 CLI 重新出图并对比 `out/qingming.png`，不能只改不验。

## 红线
- 不把「Splat 全面优于 Mesh」写进任何文案——没有消融数据之前只能写「表示方式更灵活」。
- 不引入受版权保护的图片/模型素材；形状全部程序化生成。
- 不改动画时间轴的物理逻辑（船速、收帆区间）除非在 commit message 里写明理由。
- 上游 API 以本地克隆的仓库源码为准（src/sculpt.js、examples/ 是最可靠的文档），不要凭博客文章猜 API。
