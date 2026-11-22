/* 清明上河图 · 虹桥夜渡 — Ink Studio scene
 * SDF solids -> surface-sampled Gaussian splats -> pixel-art resolve.
 * Key moment (t is static in upstream bake): the boat is under the Hong Bridge,
 * its sail half-lowered to clear the arch. The fully animated version
 * (sail lowering/raising, fog, reflections) lives in web/index.html.
 *
 * Run with upstream Ink Studio:
 *   node /path/to/ink-studio/cli/ink-studio.js render scenes/qingming-night.js --t 0 --out out/qingming.png
 */
module.exports = ({ KIT: K, makeBuilder, makeSculpt }) => ({
  id: 'qingming-night',
  name: 'Qingming Night — Hong Bridge',
  seed: 7,
  build(seed) {
    const PAL = [
      0x0b1026, 0x16233f, 0x2a3a5c, 0x46586e, 0x6b7f92, // 0-4 night sky / stone
      0x3a2a20, 0x5d4230, 0x8a6544,                     // 5-7 wood
      0x1f2c3d, 0x33465e, 0x55708c,                     // 8-10 roofs
      0x0e2233, 0x17384d, 0x2e5f74,                     // 11-13 water
      0x8a2f22, 0xd96c2c, 0xffb84d, 0xffe9b0,           // 14-17 lantern / warm light
      0xe8e4c8, 0xf7f3da,                               // 18-19 moon
      0x8fa3b8,                                         // 20 fog
      0x7a6a52, 0xb3a184, 0xd8c9a8,                     // 21-23 sail cloth
      0x1c3328, 0x2e5238, 0x477052,                     // 24-26 foliage
      0x78241c, 0xa83628, 0xc6543a,                     // 27-29 cinnabar red wood
      0xa88a5e, 0x806644                                // 30-31 woven mat
    ];
    const B = makeBuilder(seed, PAL);
    const S = K.sculpt(makeSculpt(B));
    Object.assign(S, {
      res: 0.16, amb: 0.32, sky: 0.18, sunK: 0.55,
      sun: K.V.norm([-0.45, 0.75, -0.35]) // moonlight, from back-left high
    });

    const stone = { r: [2, 3, 3, 4] };
    const stoneDark = { r: [1, 2, 3] };
    const wood = { r: [5, 6, 6, 7] };
    const woodDark = { r: [5, 5, 6] };
    const roof = { r: [8, 9, 9, 10] };
    const water = { r: [11, 12, 12, 13], mod: (x, y, z) => 0.35 * (B.n3(x * 0.8, 0, z * 1.4) - 0.5) };
    const bank = { r: [1, 2, 2, 3] };
    const cloth = { r: [21, 22, 22, 23] };
    const leaf = { r: [24, 25, 25, 26] };
    const lampRed = { r: [14, 15, 16], em: true };
    const lampGold = { r: [15, 16, 17], em: true };
    const moonMat = { r: [18, 19, 19], em: true };
    const fogMat = { r: [20], a: 0.10, ghost: true };
    const redWood = { r: [27, 28, 28, 29] };
    const redDark = { r: [27, 27, 28] };
    const matW = { r: [30, 30, 31] };
    const matDark = { r: [31, 31, 30] };

    // ---- water & banks (river flows along X, width along Z) ----
    S.box([0, -0.12, 0], [12, 0.12, 2.3], water, { res: 0.22 });
    S.box([0, 0.02, 4.9], [12, 0.28, 2.1], bank, { res: 0.24 });   // front bank (low)
    S.box([0, 0.25, -4.6], [12, 0.5, 2.4], bank, { res: 0.24 });  // back bank

    // ---- Hong Bridge: cinnabar timber arch (per the reference), stone abutments, crowded railed deck ----
    const R = 2.9, CY = 0.1;
    const deckY = z => { const th = Math.acos(Math.max(-1, Math.min(1, z / (R + 0.42)))); return CY + Math.sin(th) * (R + 0.42); };
    for (const rx of [-1.16, -0.58, 0, 0.58, 1.16])
      for (let i = 0; i <= 16; i++) {
        const th = (i / 16) * Math.PI, z = Math.cos(th) * R, y = CY - 0.08 + Math.sin(th) * R;
        S.box([rx, y, z], [0.10, 0.17, 0.32], i % 2 ? redDark : redWood, { rd: 0.03, res: 0.15 });
      }
    for (const fx of [-1.32, 1.32])
      for (let i = 0; i <= 16; i++) {
        const th = (i / 16) * Math.PI, z = Math.cos(th) * (R + 0.1), y = CY + Math.sin(th) * (R + 0.1);
        S.box([fx, y, z], [0.09, 0.24, 0.34], redWood, { rd: 0.03, res: 0.15 });
      }
    for (const sd of [-1, 1]) {
      S.box([0, 0.55, sd * 3.35], [1.5, 0.85, 0.75], stoneDark, { rd: 0.05 });
      S.box([0, 1.15, sd * 2.95], [1.45, 0.28, 0.5], stone, { rd: 0.05 });
    }
    for (let i = 0; i <= 12; i++) {
      const th = (i / 12) * Math.PI;
      const z = Math.cos(th) * (R + 0.42), y = CY + Math.sin(th) * (R + 0.42);
      S.box([0, y, z], [1.34, 0.09, 0.34], wood, { res: 0.14 });
      for (const fx of [-1.3, 1.3]) {
        S.box([fx, y + 0.36, z], [0.055, 0.3, 0.055], redDark, {});
        if (i === 2 || i === 10) S.ball([fx, y + 0.85, z], 0.13, lampRed, { ghost: true, res: 0.07 });
      }
    }
    // crowd leaning on the rails, watching the boat
    const crowdCols = [{ r: [8, 9, 10] }, { r: [21, 22, 23] }, matW, { r: [24, 25, 26] }];
    [[-0.95, -2.5], [0.95, -2.2], [-0.95, -1.7], [0.9, -1.2], [-0.9, -0.6], [0.95, -0.1], [-0.95, 0.5], [0.9, 1.0], [-0.9, 1.6], [0.95, 2.1], [-0.95, 2.6], [0.2, -2.9]].forEach(([fx, fz], i) => {
      const fy = deckY(fz) + 0.12, cm = crowdCols[i % crowdCols.length];
      S.box([fx, fy + 0.28, fz], [0.11, 0.28, 0.09], cm, { res: 0.09 });
      S.ball([fx + (fx > 0 ? 0.06 : -0.06), fy + 0.68, fz], 0.11, { r: [21, 22, 23] }, { res: 0.06 });
    });

    // ---- houses on the back bank (stepped roofs, lit windows) ----
    function house(x, z, w, h, d) {
      S.box([x, 0.75 + h / 2, z], [w / 2, h / 2, d / 2], wood, { rd: 0.04 });
      for (let i = 0; i < 3; i++)
        S.box([x, 0.75 + h + 0.16 + i * 0.22, z], [w / 2 + 0.35 - i * 0.28, 0.11, d / 2 + 0.35 - i * 0.26], roof, { res: 0.15 });
      S.box([x - w * 0.22, 0.75 + h * 0.55, z + d / 2 + 0.03], [0.16, 0.22, 0.03], lampGold, { ghost: true, res: 0.06 });
      S.ball([x + w / 2 + 0.15, 0.75 + h + 0.55, z], 0.13, lampRed, { ghost: true, res: 0.07 });
    }
    house(-7.6, -4.4, 3.0, 1.9, 1.8);
    house(-4.4, -4.9, 2.4, 1.5, 1.6);
    house(5.2, -4.7, 2.8, 1.7, 1.7);
    house(8.3, -4.3, 3.2, 2.1, 1.9);
    // small tea stall on the front bank
    S.box([7.8, 0.95, 4.3], [1.1, 0.45, 0.8], wood, {});
    for (const sx of [-1, 1]) for (const sz of [-1, 1])
      S.tube([[7.8 + sx * 1.0, 0.75, 4.3 + sz * 0.7], [7.8 + sx * 1.0, 1.75, 4.3 + sz * 0.7]], 0.05, 0.05, woodDark, {});
    S.box([7.8, 1.85, 4.3], [1.35, 0.10, 1.0], roof, {});
    S.ball([7.8, 1.45, 4.3], 0.15, lampRed, { ghost: true, res: 0.07 });

    // ---- trees ----
    function tree(x, z, s) {
      S.tube([[x, 0.7, z], [x + 0.15 * s, 0.7 + 1.1 * s, z]], 0.09 * s, 0.06 * s, woodDark, {});
      S.ball([x + 0.2 * s, 0.7 + 1.55 * s, z], [0.85 * s, 0.62 * s, 0.8 * s], leaf, { res: 0.15 });
      S.ball([x - 0.45 * s, 0.7 + 1.25 * s, z + 0.2], [0.55 * s, 0.42 * s, 0.5 * s], leaf, { res: 0.15 });
    }
    tree(-9.8, -3.6, 1.15); tree(3.4, -3.9, 0.95); tree(-6.2, 4.6, 1.0); tree(10.2, 4.4, 1.2);

    // ---- the boat, approaching the arch: mast LOWERED diagonally, sail furled on it (per the reference) ----
    const bx = 4.6, bz = 0;
    S.ball([bx, 0.28, bz], [2.3, 0.5, 0.72], woodDark, { res: 0.14 });            // hull
    S.box([bx, 0.62, bz], [1.9, 0.10, 0.6], wood, {});                              // deck
    S.box([bx + 2.35, 0.62, bz], [0.24, 0.14, 0.46], woodDark, {});                 // upturned bow step
    S.box([bx - 2.35, 0.62, bz], [0.24, 0.14, 0.46], woodDark, {});                 // stern step
    // big woven-mat cabin
    S.box([bx - 0.85, 1.12, bz], [0.78, 0.52, 0.56], matW, { rd: 0.04, res: 0.13 });
    S.box([bx - 0.85, 1.72, bz], [0.95, 0.09, 0.7], matDark, { res: 0.14 });
    S.box([bx - 1.18, 1.18, bz + 0.57], [0.2, 0.26, 0.02], lampGold, { ghost: true, res: 0.06 });
    S.ball([bx - 0.85, 1.9, bz + 0.1], [0.68, 0.13, 0.26], cloth, { res: 0.12 });    // spare sail bundle on roof
    // mast step A-frame + mast lowered toward the bow (angle ~58 deg from vertical)
    S.tube([[bx + 0.18, 0.66, bz + 0.42], [bx + 0.55, 1.5, bz]], 0.045, 0.045, woodDark, {});
    S.tube([[bx + 0.18, 0.66, bz - 0.42], [bx + 0.55, 1.5, bz]], 0.045, 0.045, woodDark, {});
    S.tube([[bx + 0.55, 0.62, bz], [bx + 3.05, 2.28, bz]], 0.06, 0.045, woodDark, { res: 0.12 });
    // sail furled: cloth bundle hugging the lowered mast
    S.tube([[bx + 0.78, 1.02, bz + 0.12], [bx + 2.9, 2.12, bz + 0.12]], 0.09, 0.07, cloth, { res: 0.1 });
    // cargo: woven baskets fore, bales aft
    S.ball([bx + 1.5, 0.9, bz + 0.28], [0.34, 0.27, 0.34], matW, { res: 0.11 });
    S.ball([bx + 1.45, 0.9, bz - 0.32], [0.3, 0.24, 0.3], matDark, { res: 0.11 });
    S.ball([bx + 1.55, 1.3, bz], [0.26, 0.2, 0.26], matW, { res: 0.11 });
    S.box([bx - 1.98, 0.9, bz + 0.27], [0.28, 0.17, 0.26], matDark, {});
    S.box([bx - 1.98, 0.9, bz - 0.3], [0.28, 0.17, 0.26], matW, {});
    S.ball([bx + 2.55, 0.95, bz], 0.13, lampRed, { ghost: true, res: 0.07 });       // bow lantern
    S.ball([bx - 2.55, 1.0, bz], 0.13, lampGold, { ghost: true, res: 0.07 });       // stern lantern
    // boatmen: bow puller with rope, roof hand at the mast foot, stern poler
    S.tube([[bx + 1.92, 0.78, bz + 0.18], [bx + 2.18, 1.38, bz + 0.18]], 0.1, 0.08, { r: [8, 9, 10] }, { res: 0.08 });
    S.ball([bx + 2.24, 1.56, bz + 0.18], 0.12, { r: [21, 22, 23] }, { res: 0.06 });
    S.tube([[bx + 2.3, 1.35, bz + 0.18], [bx + 3.05, 1.78, bz + 0.18]], 0.022, 0.022, matW, { res: 0.08 });
    S.tube([[bx - 0.35, 1.98, bz], [bx - 0.02, 1.9, bz]], 0.09, 0.07, { r: [24, 25, 26] }, { res: 0.08 });
    S.ball([bx + 0.04, 2.04, bz], 0.11, { r: [21, 22, 23] }, { res: 0.06 });
    S.tube([[bx - 2.12, 0.78, bz - 0.25], [bx - 2.06, 1.5, bz - 0.25]], 0.1, 0.08, { r: [8, 9, 10] }, { res: 0.08 });
    S.ball([bx - 2.04, 1.66, bz - 0.25], 0.12, { r: [21, 22, 23] }, { res: 0.06 });
    S.tube([[bx - 2.2, 1.25, bz - 0.3], [bx - 2.88, -0.05, bz - 0.5]], 0.03, 0.03, woodDark, {});

    // ---- moon & fog ----
    S.ball([-7.8, 7.6, -7.5], [1.05, 1.05, 0.3], moonMat, { ghost: true, res: 0.2 });

    S.bake();
    return B.finish({
      cam: { target: [0.4, 1.8, 0], dist: 17.5, pitch: 0.17, yaw: 0.38, sway: 0 },
      radius: 13, detail: 26, dither: 0.35, palName: 'QingmingNight'
    });
  }
});
