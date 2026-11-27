// 季節の天気あての問題を作る（ブラウザと node の両方で使う）。
// 中身は、千葉県教育委員会「やる気アップ 理科」2年 日本の天気（解答つき）・横浜市立中学校の学習課題（解答つき）・気象庁の予報用語（気圧配置・高気圧と低気圧）・気象庁キッズ「西高東低って何？」（下の SRC。2026-11-17 に読んだ）で確かめたことだけ。
// 1問は、天気図や天気のようすを見て、どの天気か（冬・春と秋・つゆ・夏・台風）を選ぶ。正解したら2段目「もとになる空気は？」を選ぶ。
// 問いに季節の名前を書かない（QA が見る）。秋雨前線は「春・秋」とまぎれるので問いに出さない（まめ知識だけ）。
// 選び肢は、ほかの4つから選ぶ（やさしいは2つ、ふつう・むずかしいは3つ）。
// 乱数 R は呼ぶ回数が毎回同じになるように使う（sort の比較の中では引かない）。同じ tag なら、どの端末でも同じ問題になる。
// KINDS・言い回しの並びは最後に足すだけにする（並べ替え・削除をすると過去の日の問題が変わる）。
(function (root) {
  "use strict";
  const LV = ["やさしい", "ふつう", "むずかしい"];

  // 出典（画面の「なぜ」に出す）
  const SRC = {
    chiba: ["千葉県教育委員会「やる気アップ 理科」中学2年 日本の天気（解答つき）", "https://www.pref.chiba.lg.jp/kyouiku/shidou/gakuryoku/yaruki/rika/documents/23r02.pdf"],
    yoko: ["横浜市立境木中学校 理科の学習課題（天気。解答つき）", "https://www.edu.city.yokohama.jp/school/jhs/sakaigi/index.cfm/1,2084,c,html/2084/20200515-124231.pdf"],
    haichi: ["気象庁「予報用語 気団・前線・気圧配置」", "https://www.jma.go.jp/jma/kishou/know/yougo_hp/haichi3.html"],
    koki: ["気象庁「予報用語 気圧・高気圧・低気圧」", "https://www.jma.go.jp/jma/kishou/know/yougo_hp/haichi1.html"],
    kids: ["気象庁キッズ「西高東低って何？」", "https://www.jma.go.jp/jma/kids/kids/faq/a5_18.html"],
  };

  // 答えになる5つ
  const CLASSES = ["冬の天気", "春・秋の天気", "つゆの天気", "夏の天気", "台風"];

  // 2段目「もとになる空気は？」の3つ
  const GROUPS = {
    kan: { name: "冷たく乾いた大陸の空気", sub: "シベリア気団" },
    dan: { name: "温かい海の空気", sub: "小笠原気団・熱帯の海" },
    sak: { name: "冷たい空気と温かい空気の境目", sub: "前線をともなう" },
  };
  // 気圧配置などのよび名（「なぜ」に出す）
  const CATS = { fuyu: "西高東低（冬型）", ido: "移動性高気圧と低気圧", tsuyu: "梅雨前線（停滞前線）", natsu: "南高北低（夏型）", nettai: "熱帯の海で発達した低気圧" };
  // 答えごとの決まり。2段目・よび名・決め手はこの表で決まる（qa/run.mjs が別に持った表でも確かめる）
  const RULE = {
    "冬の天気": { grp: "kan", cat: "fuyu", key: "西高東低でシベリア気団（冷たく乾燥）が発達し、北西の季節風。日本海側は雪、太平洋側は乾燥した晴れ。" },
    "春・秋の天気": { grp: "sak", cat: "ido", key: "移動性高気圧と温帯低気圧が交互に東へ進み、4〜6日くらいの周期で天気が変わります。" },
    "つゆの天気": { grp: "sak", cat: "tsuyu", key: "オホーツク海気団と小笠原気団がぶつかって停滞前線（梅雨前線）ができ、長い雨が続きます。" },
    "夏の天気": { grp: "dan", cat: "natsu", key: "小笠原気団（太平洋高気圧）が強くなり、南東の季節風。高温で湿度が高くなります。" },
    "台風": { grp: "dan", cat: "nettai", key: "熱帯の太平洋上で発生し、最大風速が17.2m/sをこえるようになったものが台風です。" },
  };

  // part:ri:begin（shared-workflows の template/parts/data/ri.js の写し。ここでは直さない。node scripts/sync-template.mjs で写す）
  const ri = (R, a, b) => a + Math.floor(R() * (b - a + 1));
  // part:ri:end
  // part:shuffle:begin（shared-workflows の template/parts/data/shuffle.js の写し。ここでは直さない。node scripts/sync-template.mjs で写す）
  function shuffle(R, a) { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = ri(R, 0, i); [b[i], b[j]] = [b[j], b[i]]; } return b; }
  // part:shuffle:end
  // part:pickN:begin（shared-workflows の template/parts/data/pickN.js の写し。ここでは直さない。node scripts/sync-template.mjs で写す）
  function pickN(R, a, n) { return shuffle(R, a).slice(0, n); }
  // part:pickN:end
  const MEDIA = ["天気図で", "天気予報で", "理科の授業で", "ニュースで", "テスト勉強で"];
  // 問いの前につく言い方（どれでも答えは同じ）
  const PRE = ["ある日の天気。", "天気図を見た。", "天気予報の解説。", "ある時期の天気。", "日本付近のようす。"];

  // どれかを当てる問題。ans：答え、sit：言い方。選び肢は、ほかの4つから（やさしいは2つ、ふつう・むずかしいは3つ）
  function which(ans, sit) {
    const near = CLASSES.filter((c) => c !== ans);
    return (R, lv) => {
      const si = ri(R, 0, sit.length - 1), mi = ri(R, 0, MEDIA.length - 1);
      const n = lv === 0 ? 2 : 3, ds = pickN(R, near, n);
      const q = sit[si] + "　どの天気？";
      return { type: "act", media: MEDIA[mi], q, opts: shuffle(R, [ans, ...ds]), ans, rev: false, v: `${si}:${mi}` };
    };
  }
  // 1つの種類を作る。grp・cat・key は答えの決まり RULE から。clue は手がかりの文（PRE と組む）
  function K(id, lv, ans, name, src, look, why, clue) {
    const r = RULE[ans];
    return { id, lv, grp: r.grp, cat: r.cat, ans, name, src, look, key: r.key, why, make: which(ans, clue.flatMap((c) => PRE.map((p) => p + c))) };
  }

  const KINDS = [
    // ---- やさしい ----
    K("f_seiko", 0, "冬の天気", "西の大陸で高く東の海で低い", ["kids", "chiba"], "西と東、どちらの気圧が高いでしょう。",
      "西の大陸側の気圧が高く、東の海側が低いのが西高東低です（気象庁キッズ）。冬によく現れます。",
      ["西の大陸側で気圧が高く、東の海側で気圧が低い。", "天気図の気圧配置は西高東低になっている。"]),
    K("h_shuki", 0, "春・秋の天気", "4〜6日の周期で変わる", ["chiba", "koki"], "天気がくり返し変わります。",
      "高気圧と低気圧が次々とやってきて、4〜6日くらいの周期で天気が変わるのは春と秋です（千葉県のプリント）。",
      ["高気圧と低気圧が次々とやってきて、4〜6日くらいの周期で天気が変わる。"]),
    K("t_nagaame", 0, "つゆの天気", "5月中旬から長い雨", ["chiba"], "5月中旬から7月下旬ごろの長い雨です。",
      "5月中旬から7月下旬にかけて、北海道をのぞく日本列島は長い雨の時期（つゆ）に入ります（千葉県のプリント）。",
      ["5月中旬から7月下旬にかけて、北海道をのぞく日本列島で長い雨の時期が続く。"]),
    K("n_nanko", 0, "夏の天気", "南が高く北が低い", ["haichi"], "南と北、どちらの気圧が高いでしょう。",
      "日本付近から見て南が高く北が低い気圧配置（南高北低）は、夏に典型的に現れます（気象庁の予報用語）。",
      ["日本付近から見て、南の気圧が高く、北が低い。", "天気図の気圧配置は南高北低になっている。"]),
    K("y_172", 0, "台風", "最大風速が17.2m/sをこえた", ["yoko", "koki"], "熱帯の海で生まれた低気圧です。",
      "熱帯地方の太平洋上で発生し、最大風速が17.2m/sをこえるようになったものが台風です（横浜市の学習課題）。",
      ["熱帯地方の太平洋上で発生した低気圧が発達し、最大風速が17.2m/sをこえた。"]),
    // ---- ふつう ----
    K("f_yuki", 1, "冬の天気", "日本海側は雪・太平洋側は晴れ", ["chiba"], "日本海側と太平洋側で天気がちがいます。",
      "季節風が日本海をわたるとき水蒸気を吸って日本海側に雪を降らせ、太平洋側には乾いた風がふいて晴れます（千葉県のプリント）。",
      ["日本海側では雪が続き、太平洋側では乾燥した晴れの日が続く。", "北西の季節風がふき、日本海側に雪が降っている。"]),
    K("h_idosei", 1, "春・秋の天気", "高気圧が低気圧と交互に東へ", ["koki"], "高気圧が東へ動いていきます。",
      "温帯低気圧と交互に東へ移動していく高気圧を移動性高気圧といい、春と秋に多く現れます（気象庁の予報用語）。",
      ["温帯低気圧と交互に、高気圧が東へ移動していく。", "移動性高気圧が日本付近を通り、次に低気圧が近づいてくる。"]),
    K("t_butsukaru", 1, "つゆの天気", "2つの気団がぶつかる", ["chiba", "yoko"], "オホーツク海気団と小笠原気団です。",
      "勢力がほぼつり合ったオホーツク海気団と小笠原気団がぶつかって、停滞前線（梅雨前線）ができます（千葉県のプリント）。",
      ["勢力がほぼつり合ったオホーツク海気団と小笠原気団がぶつかり、停滞前線ができている。"]),
    K("n_nanto", 1, "夏の天気", "南東の季節風", ["chiba"], "小笠原気団が強くなるころです。",
      "小笠原気団の勢力が強くなると、南東の季節風がふき、高温で湿度が高くなります（千葉県のプリント）。",
      ["小笠原気団の勢力が強くなり、南東の季節風がふいて、高温で湿度が高い。"]),
    K("y_tenko", 1, "台風", "西向きから北や東へ向きを変える", ["haichi"], "熱帯の海から北へ進んでくるものです。",
      "偏西風の影響を受けて、進路が西向きから北または東向きに変わることを「転向する」といいます（気象庁の予報用語。台風の進路）。",
      ["熱帯の海で発達した低気圧が、偏西風の影響で進路を西向きから北や東向きに変えた。"]),
    // ---- むずかしい ----
    K("f_kata", 2, "冬の天気", "大陸に高気圧・東の海に低気圧", ["haichi", "koki"], "大陸の高気圧と、東の海上の低気圧です。",
      "大陸に高気圧、日本の東の海上から千島列島・オホーツク海方面に発達した低気圧がある気圧配置を冬型といいます（気象庁の予報用語）。",
      ["大陸に高気圧があり、日本の東の海上に発達した低気圧がある。", "シベリア高気圧とアリューシャン低気圧が、日本付近の気圧配置をつくっている。"]),
    K("h_taijo", 2, "春・秋の天気", "東西にのびた高気圧", ["koki"], "東西に長い高気圧です。",
      "東西にのびた帯状高気圧は春と秋に多く現れ、晴天が続きます（気象庁の予報用語）。",
      ["東西に長くのびた帯状の高気圧におおわれ、晴天が続いている。"]),
    K("t_gata", 2, "つゆの天気", "北と南に高気圧・前線が停滞", ["haichi", "koki"], "北の高気圧はオホーツク海方面です。",
      "オホーツク海方面にオホーツク海高気圧、日本の南に太平洋高気圧があり、前線が停滞する気圧配置です（気象庁の予報用語）。",
      ["オホーツク海方面に高気圧、日本の南に太平洋高気圧があり、日本付近に前線が停滞している。", "オホーツク海高気圧が現れ、北日本の太平洋側で低温・日照不足が続く。"]),
    K("n_gata", 2, "夏の天気", "太平洋高気圧が日本をおおう", ["haichi", "koki"], "大陸は低気圧になっています。",
      "日本の南または南東の海上に太平洋高気圧があって日本付近をおおい、大陸が低気圧となっている気圧配置を夏型といいます（気象庁の予報用語）。",
      ["日本の南東の海上の太平洋高気圧が日本付近をおおい、大陸は低気圧になっている。"]),
    K("y_17", 2, "台風", "風力8以上の熱帯の低気圧", ["koki", "yoko"], "最大風速がおよそ17m/s以上です。",
      "最大風速がおよそ17m/s（34ノット、風力8）以上の熱帯の低気圧が台風です（気象庁の予報用語・横浜市の学習課題）。",
      ["熱帯の海で発生した低気圧で、最大風速がおよそ17m/s（風力8）以上ある。"]),
  ];
  const BY = Object.fromEntries(KINDS.map((k) => [k.id, k]));
  const kindsOf = (lv) => KINDS.filter((k) => k.lv === lv).map((k) => k.id);

  // part:seedOf:begin（shared-workflows の template/parts/data/seedOf.js の写し。ここでは直さない。node scripts/sync-template.mjs で写す）
  function seedOf(str) { let h = 2166136261; for (const ch of String(str)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
  // part:seedOf:end
  // part:rng:begin（shared-workflows の template/parts/data/rng.js の写し。ここでは直さない。node scripts/sync-template.mjs で写す）
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  // part:rng:end

  // 1問を作る。tag は「種類|種」（例 "f_seiko|2026-11-18:d0"）。同じ tag ならいつも同じ問題
  function make(tag) {
    const [kind] = String(tag).split("|"), k = BY[kind];
    if (!k) return null;
    const p = k.make(rng(seedOf(tag)), k.lv);
    return { tag, kind, lv: k.lv, name: k.name, look: k.look, key: k.key, why: k.why, grp: k.grp, cat: k.cat, src: k.src.map((s) => SRC[s]), ...p };
  }
  const keyOf = (P) => `${P.kind}:${P.q}:${P.opts.slice().sort().join("/")}`;

  // 今日の5問（やさしい2・ふつう2・むずかしい1）。種類は重ねない
  function dailyTags(date) {
    const R = rng(seedOf("day:" + date)), e = pickN(R, kindsOf(0), 2), n = pickN(R, kindsOf(1), 2), h = pickN(R, kindsOf(2), 1);
    return [...e, ...n, ...h].map((id, i) => `${id}|${date}:d${i}`);
  }
  // 上級の3問（むずかしいだけ・今日の5問のむずかしいとは別の種類）
  function hardTags(date) {
    const dh = dailyTags(date)[4].split("|")[0], R = rng(seedOf("hard:" + date)), h = pickN(R, kindsOf(2).filter((x) => x !== dh), 3);
    return h.map((id, i) => `${id}|${date}:h${i}`);
  }

  const KST = { KINDS, BY, GROUPS, CATS, RULE, LV, SRC, CLASSES, kindsOf, seedOf, rng, make, keyOf, dailyTags, hardTags, pickN };
  if (typeof module !== "undefined" && module.exports) module.exports = KST; else root.KST = KST;
})(typeof self !== "undefined" ? self : this);
