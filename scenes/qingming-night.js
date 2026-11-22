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
      0x1c3328, 0x2e5238, 0x477052                      // 24-26 foliage
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

    // ---- water & banks (river flows along X, width along Z) ----
    S.box([0, -0.12, 0], [12, 0.12, 2.3], water, { res: 0.22 });
    S.box([0, 0.02, 4.9], [12, 0.28, 2.1], bank, { res: 0.24 });   // front bank (low)
    S.box([0, 0.25, -4.6], [12, 0.5, 2.4], bank, { res: 0.24 });  // back bank

    // ---- Hong Bridge: stepped arch spanning Z, tunnel axis along X ----
    const R = 2.9, CY = 0.1;
    for (let i = 0; i <= 14; i++) {
      const th = (i / 14) * Math.PI;              // 0..PI over the arch
      const z = Math.cos(th) * R, y = CY + Math.sin(th) * R;
      S.box([0, y, z], [1.35, 0.30, 0.34], stone, { rd: 0.06, res: 0.15 });
    }
    // abutments
    for (const s of [-1, 1]) {
      S.box([0, 0.55, s * 3.35], [1.5, 0.85, 0.75], stoneDark, { rd: 0.05 });
      S.box([0, 1.15, s * 2.95], [1.45, 0.28, 0.5], stone, { rd: 0.05 });
    }
    // deck planks following the arc + railings with lanterns
    for (let i = 0; i <= 10; i++) {
      const th = (i / 10) * Math.PI;
      const z = Math.cos(th) * (R + 0.42), y = CY + Math.sin(th) * (R + 0.42);
      S.box([0, y, z], [1.3, 0.10, 0.36], wood, { res: 0.14 });
      if (i % 2 === 0) for (const sx of [-1, 1]) {
        S.box([sx * 1.22, y + 0.32, z], [0.07, 0.32, 0.07], woodDark, {});
        if (i === 2 || i === 8) S.ball([sx * 1.22, y + 0.78, z], 0.14, lampGold, { ghost: true, res: 0.07 });
      }
    }

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

    // ---- the boat, under the arch, sail half-lowered ----
    const bx = 4.6, bz = 0;
    S.ball([bx, 0.28, bz], [2.3, 0.5, 0.72], woodDark, { res: 0.14 });            // hull
    S.box([bx, 0.62, bz], [1.9, 0.10, 0.6], wood, {});                              // deck
    S.box([bx - 0.9, 1.05, bz], [0.55, 0.42, 0.5], wood, { rd: 0.05 });             // cabin
    S.box([bx - 0.9, 1.55, bz], [0.7, 0.09, 0.62], roof, {});                       // cabin roof
    S.tube([[bx + 0.55, 0.6, bz], [bx + 0.55, 3.1, bz]], 0.055, 0.045, woodDark, {}); // mast (top clears arch ~3.0 barely)
    // sail: lowered — cloth bunched low, top yard dropped to mid-mast
    S.box([bx + 0.55, 1.95, bz + 0.06], [0.95, 0.42, 0.045], cloth, { res: 0.10 });
    S.box([bx + 0.55, 1.42, bz + 0.06], [0.85, 0.20, 0.06], cloth, { res: 0.10 });
    S.tube([[bx - 0.45, 2.42, bz + 0.06], [bx + 1.55, 2.42, bz + 0.06]], 0.035, 0.035, woodDark, {}); // dropped yard
    S.ball([bx + 2.15, 0.85, bz], 0.13, lampRed, { ghost: true, res: 0.07 });       // bow lantern
    S.ball([bx - 2.1, 0.95, bz], 0.13, lampGold, { ghost: true, res: 0.07 });       // stern lantern
    // boatman with a pole, aft
    S.tube([[bx - 1.55, 0.7, bz + 0.2], [bx - 1.5, 1.55, bz + 0.2]], 0.09, 0.07, { r: [8, 9, 10] }, {});
    S.ball([bx - 1.5, 1.72, bz + 0.2], 0.13, { r: [21, 22, 23] }, { res: 0.07 });
    S.tube([[bx - 1.35, 1.2, bz + 0.2], [bx - 0.7, 0.25, bz + 0.55]], 0.03, 0.03, woodDark, {});

    // ---- moon & fog ----
    S.ball([-7.8, 7.6, -7.5], [1.05, 1.05, 0.3], moonMat, { ghost: true, res: 0.2 });

    S.bake();
    return B.finish({
      cam: { target: [0.4, 1.8, 0], dist: 17.5, pitch: 0.17, yaw: 0.38, sway: 0 },
      radius: 13, detail: 26, dither: 0.35, palName: 'QingmingNight'
    });
  }
});
