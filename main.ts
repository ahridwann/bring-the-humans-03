// bring-the-humans-03 entry (Node 22, standard library only).
//
// The entry is the video itself: an original 16-second vertical ad for
// make.fun, made in-session with ffmpeg from make.fun's press pack and
// posted publicly on TikTok from a public account. This program's only job
// is to hand the gate the video's address: it copies VIDEO.json from the
// repository root into /output/VIDEO.json, where the gate reads it, and the
// house then reads the video's views from TikTok. Nothing this program
// writes about the video is scored.
//
// The ad: a four-beat hook — "Your AI agent can earn real money" — then
// what make.fun is (AI agents build things and compete in paid bounties),
// the prize ("$500 in this bounty — win real money when you win"), the call
// to action ("Enter your agent on make.fun"), and it ends on make.fun's
// referral end card with referral code kc98nxwf typed in its field. The
// make.fun brand badge sits over the video from the very first frame until
// the end card, exactly as the press pack requires. All brand art, colours
// and the end card come from https://make.fun/press/ (manifest +
// llms.txt), fetched fresh on 23 Nov 2026 and used as they are; this
// repository holds no copy of the press assets.
//
// VIDEO.json here holds the posted video's address
// (https://www.tiktok.com/@ridwan.ahmad805/video/7711323766101413140,
// posted 23 Nov 2026 from Ahmad's public TikTok account). The program
// checks the address is a full tiktok.com video address before handing
// it over, so a placeholder or short link fails here with a clear
// message instead of reaching the gate.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR
// stand in for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const botRoot = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const outRoot = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const source = join(botRoot, 'VIDEO.json');
const target = join(outRoot, 'VIDEO.json');

if (!existsSync(source)) {
  console.error(`No VIDEO.json found in ${botRoot}; nothing to hand the gate.`);
  process.exit(1);
}

// The gate reads exactly the address in VIDEO.json, so check it here
// before copying: it must be a full tiktok.com video address. The starter
// placeholder and the short links (vm.tiktok.com / vt.tiktok.com) are
// refused by the house, so a bad address fails here with a clear message
// instead of reaching the gate.
let video: { url?: unknown };
try {
  video = JSON.parse(readFileSync(source, 'utf8')) as { url?: unknown };
} catch (error) {
  console.error(`VIDEO.json in ${botRoot} is not valid JSON: ${(error as Error).message}`);
  process.exit(1);
}
const url = typeof video.url === 'string' ? video.url : '';
if (!/^https:\/\/www\.tiktok\.com\/@[^/]+\/video\/\d+$/.test(url)) {
  console.error(
    `VIDEO.json in ${botRoot} does not hold a full TikTok video address (got ${JSON.stringify(url)}); ` +
      'replace it with the posted video\'s https://www.tiktok.com/@<handle>/video/<id> address before submitting.',
  );
  process.exit(1);
}

mkdirSync(outRoot, { recursive: true });

try {
  copyFileSync(source, target);
  console.log(`VIDEO.json copied to ${target}`);
} catch (error) {
  console.error(`Could not copy VIDEO.json from ${botRoot}: ${(error as Error).message}`);
  process.exit(1);
}
