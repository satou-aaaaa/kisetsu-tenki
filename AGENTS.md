# AGENTS.md

季節の天気あて：天気図や天気のようすを見て、冬・春と秋・つゆ・夏・台風のどれかを当てる1日5問の学習ゲーム。正解したら「もとになる空気は？」（冷たく乾いた大陸の空気・温かい海の空気・冷たい空気と温かい空気の境目）も選ぶ。`index.html` と `data.js`（問題の種類）を GitHub Pages で公開する。

## 準備（最初に一度）

```bash
bash scripts/setup.sh   # Node.js（版は .nvmrc）を確かめ、検査の依存とブラウザを入れる。何度実行してもよい
```

Claude Code のクラウドセッションでは `.claude/settings.json` のフックが自動で実行する。

## push する前の確認

```bash
node qa/run.mjs   # 問題（15種類×3000問：選び肢・答えは1つ・答えと2段目とよび名が天気の表どおり・出典）・今日の5問と上級（3年分）・とことん・通しで遊ぶ・続きから・2段目・復習・幅320px・PWA・引き継ぎ・見やすさ（CI の QA と同じ）
```

## このリポジトリの決まり

- 中身は千葉県教育委員会「やる気アップ 理科」2年 日本の天気（解答。<https://www.pref.chiba.lg.jp/kyouiku/shidou/gakuryoku/yaruki/rika/documents/23r02.pdf>）・横浜市立境木中学校の学習課題（解答）・気象庁「予報用語」（気圧配置・高気圧と低気圧）・気象庁キッズ「西高東低って何？」で確かめたことだけ（2026-11-17 に読んだ）。手がかりを足すときも出典に書いてあることだけにし、`qa/run.mjs` の `TB`（別に書いた表）にも足す。出典メモは共有フォルダ games/kisetsu-research.md。
- 問いに季節の名前（冬・春・秋・つゆ・梅雨・夏・台風）を書かない（QA が見る）。秋雨前線は「春・秋」とまぎれるので、問いに出さずまめ知識だけにする。問いの天気は作った例で、実際の予報として出さない。
- 答えの決まり（2段目・よび名・決め手）は `data.js` の `RULE` だけに書き、種類はそこから読む。`qa/run.mjs` の `CL` が別に書いた表で確かめる。
- 天気図よみ（tenkizu-yomi。等圧線と風）・予報ことばよみ（yohou-kotoba）・雲の名前あて（kumo-namae）・二十四節気（nijushi-sekki）と重ねない。
- 問題は、やさしいが選び肢3つ、ふつう・むずかしいが4つ（5つから）。2回目のヒントはまちがいを消して2つにしぼり、決め手（`key`）も見せる。
- 今日の5問（やさしい2・ふつう2・むずかしい1、種類は重ねない）・上級（むずかしい3、今日のむずかしいと別）は日本時間の日付の種で決まり、だれでも同じ。`Math.random()` は練習・とことんの種だけ。乱数は `sort` の比較の中で引かない。`KINDS`・言い回しの並びは最後に足すだけ（QA の `PIN` が第1回の1問目を見る）。`data.js` を変える PR は自動ではマージされない（`hold_paths`）。
- ★はまちがい＋ヒントの数（0で★3・1で★2・2以上で★1）。上級はヒントなし。時間制限なし。
- 好きなだけ遊べる：チケット・ライフ・回数制限・🔒で開くモードを入れない（shared-workflows `routines/game-dev.md` F1〜F7。QA が見る）。とことん（`runs.e`）はまちがえても続き、「ここで降りる」で終わる。
- 1問を深くする：`depth.js` と `qa/depth-check.mjs` は shared-workflows `template/` の写しで、ここでは直さない。自信あり・2段目「もとになる空気は？」・復習（1→3→7日後）。記録 `kst-v1`・文字 `kst-fs`・復習 `kst-depth`。
- 共有は遊ぶ人が押したときに開くリンクだけ。シェアの文に問題・答えを出さない。感想は Issue フォーム（`.github/ISSUE_TEMPLATE/feedback.yml`）を開くだけ。応援は Ko-fi へのただのリンクだけ。
- 外へ通信しない（CSP の `connect-src 'self'` を広げない）。見やすさ（`<!-- a11y:begin -->`〜`end`・`qa/a11y.mjs`）と引き継ぎ（`transfer.js`・`qa/transfer-check.mjs`）は shared-workflows `template/` の写しで、ここでは直さない。
- 画面の土台は気体あて（kitai-ate。もとは液性よみ・植物なかま分け・動物なかま分け・なに税？）から写した。写し元の言葉が残っていないかを QA が見る。
- PWA：画面のファイルを足したら `sw.js` の `SHELL` にも足し、中身を大きく変えたら `CACHE` の版を上げる。アイコンは `node tools/make-icons.cjs`、`og.png` は `node tools/make-og.cjs`。
- 公開リポジトリなので、個人情報・鍵を入れない。

## 公開

- GitHub Pages は `main` のルート（`/`）を公開する。PR の QA と Secret scan が ✅ になると `automerge.yml` が自動でマージする。止めたいときは下書きにするか、ラベル「自動マージしない」を付ける。
- `sw.js`・`manifest.webmanifest`・`data.js` を変える PR は自動ではマージされない（`hold_paths`）。CodeRabbit のレビューを読み、手でマージする直前に今の head へのレビューを読み直す。CodeRabbit は PR に `@coderabbitai review` とコメントして頼む。

## 共通のきまり

- PR の作り方・マージの仕方は satou-aaaaa/shared-workflows の `routines/pr.md`、全体のきまりは `routines/common.md` に従う。
- CI の部品は shared-workflows の共通部品を呼ぶ。リポジトリ側の .github/workflows には呼び出しと設定値だけを書く。
- Claude 以外の AI・人が作業するときは、shared-workflows の `routines/tool-map.md` と `routines/without-claude.md` を読む。
