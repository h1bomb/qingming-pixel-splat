# 技术拆解：Pixel-Art Gaussian Splatting（虹桥夜渡实现笔记）

## 核实状态（2026-11-22 实测）
- 上游仓库 siliconjungle/shapeshift-labs-ink-studio 真实存在：2026-11-16 建仓，MIT，JavaScript，Node ≥18，零运行时依赖；
  本地克隆后 CLI 可用（`scenes` 列出 7 个内置 diorama，`render` 可出 PNG）。
- 场景文件格式已实测：`module.exports = ({KIT, makeBuilder, makeSculpt}) => ({id, name, seed, build(seed)})`，
  build 内用 `S.box/S.ball/S.tube/S.lathe/S.torus/S.ground` 等 SDF 实体，`S.bake()` 后 `B.finish({cam, ...})`。
  本项目 `scenes/qingming-night.js` 按此格式编写，渲染成功（900×620，no warnings）。
- 星标量级：第三方索引 2026-11-22 显示约 950 stars（建仓 6 天），数字会变，引用时注明日期。

## 为什么这套管线比「3D 渲染 + 马赛克滤镜」更有表现力
1. 表示层不同：场景的真身是三维空间中的高斯点集（位置/法线/颜色/尺寸/自发光），不是一张位图。
   点集可逐点移动、散开、重组——收帆本质上就是帆面点集的 Y 轴压缩 + 横桁点集下移，同一批点完成变形。
2. 采样层：表面采样按曲率与轮廓密度分配点，平坦区省点、折角加密，低分辨率下细结构（眼睛、栏杆、桥洞边缘）不容易丢。
3. Resolve 层：色板量化 + 世界空间抖动 + 描边 + 稳定性处理是为「镜头动起来不闪」设计的，普通降采样滤镜没有这一层。

## 与替代路线的对比（写稿/答辩口径，未做消融前不下结论）
| 路线 | 优势 | 局限 |
|---|---|---|
| Mesh + 像素 Shader | 成熟、性能好 | 柔和粒子/可变形点集要额外系统 |
| Voxel | 结构明确、易编辑破坏 | 曲面台阶感、数据量大 |
| SDF Ray Marching | 建模灵活、表面连续 | 复杂光照/变形代价高 |
| Gaussian Splatting（本项目） | 非规则形状、透明层、逐点变形天然 | 排序与 overdraw 成本、动态更新贵 |

待验证：同场景三路线画质/性能对照（已写进 CURSOR_TASK 第 4 项）；
复杂场景帧率、大量动态 splat 的开销、长时间交互稳定性。

## 动态版实现要点（web/index.html）
- 采样器：box（6 面网格）、ellipsoid（Fibonacci 球面分布）、tube（圆柱环带）、plane（帆面）、disc（月）。
- 相机：标准 look-at（fwd/right/up 基向量），世界空间法线做月光明暗，自发光不吃光（月面 kind=5 恒定亮度，灯笼带相位闪烁）。
- 教训存档：① 相机必须站在前岸一侧（yaw≈2.59），站在后岸会被临水房屋的屋顶线挡住河面与船身下部；
  ② 泼溅尺寸必须 ≥ 采样间距（size ≈ step × scale × 0.55 起步），否则画面是点云不是表面；
  ③ 雾用大泼溅时总不透明度按重叠数估算，单粒 alpha 要压到 0.01–0.026 量级，否则叠成白墙。
