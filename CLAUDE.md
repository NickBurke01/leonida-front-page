# Leonida Front Page: project memory

Loaded automatically by Claude in every session on this repo. Sources: this repo (README, `src/config/site.ts`, workflows) and the shared Drive folder **Leonida Network (Justin + Nick)**: "Leonida Network Playbook" and "LeonidaFP Long Video Episode Format". Last imported 2026-11-26.

## The brand
- **Leonida Front Page**: an "everything GTA 6" fan brand (guides, secrets, news, story recaps). Not affiliated with Rockstar or Take-Two; never use Rockstar art.
- Tagline: "Shorts give you the headline. We give you the complete picture."
- Run as a two-channel network by **Justin** (his Claude is "Jarvis") and **Nick** (this user). Shuri also posts.

### Channels (as configured on the website)
| Role | Name | Handle | Channel ID |
|---|---|---|---|
| Long form | Leonida Front Page | @FrontPageLeonida | UCYQrsIQpKIGQuLw9PMO68nw |
| Daily Shorts | Leonida FP | @LeonidaFP | UCDgujTykhKXMQbi8-mmuncQ |

**Open conflict:** the Playbook doc says the opposite (LeonidaFrontPage = Justin's daily Shorts; LeonidaFP = Nick's weekly long videos), and the Episode Format doc lists the long-video channel as Unknown. Confirm with Nick before changing anything that depends on which channel is which.

## The website (this repo)
- Astro 7 static site, Pagefind search, hosted on Netlify: https://leonidafrontpage.netlify.app (name must stay `leonidafrontpage`, never `frontpageleonida`). Possible later domain: leonidafrontpage.com.
- All brand/channel values live in `src/config/site.ts` only. Look: `src/config/theme.ts` (Broadsheet / Night Desk) and the top of `src/styles/global.css`. Brand images: `npm run brand` from `brand/`.
- Self-updating: newest long video becomes the front-page lead; Shorts shown only if ≥1,000 views and above the channel median (`TOP_SHORTS`).
- `.github/workflows/check-youtube.yml`: every 48 h (~6am Central) checks both channels' RSS against `/latest.json` and calls the Netlify build hook (`NETLIFY_BUILD_HOOK` secret) only on a new upload.
- Monthly review: a Claude cloud routine on the 1st (16:00 UTC) opens a "Monthly website review" PR (`docs/reviews/YYYY-MM.md`). Nothing goes live until merged.
- Content: guides `src/content/guides/` and news `src/content/news/` (copy `_TEMPLATE.md`; `placeholder: false` to publish). Database (vehicles, weapons, characters, checklist as JSON; missions as MD): copy `_EXAMPLE`, **confirmed facts only**, set `confirmedIn` and `lastVerified`, stats 0-100, spoilers behind `spoiler: true`. A section appears only once it has an entry.
- Attach video with `youtubeId: <11 chars>`. Newsletter signups: Netlify Forms → `newsletter`. Contact email and TikTok/X links still empty.
- Commands: `npm run dev`, `npm run dev:live` (sample data), `npm run build`.
- Related artifacts: "Leonida Front Page Site Preview" and "Leonida Front Page Website Setup" (Sheet) in claude.ai.

## Network workflow (Playbook)
- Drive folders: `01 Ideas & Scripts` (YYYY-MM-DD - Topic - SCRIPT), `02 Long Videos (Nick)` (… - LONG), `03 Shorts Queue (for Jarvis check)` (… - SHORT), `04 Shorts Ready to Post` (only Jarvis moves files here). Sheet "Leonida Network - Content Calendar": add every video before starting; status Idea → Scripting → Editing → In Queue → Ready → Posted.
- Week: Monday pick topic + check calendar + script to 01; edit long video to 02 with title, description, thumbnail, pinned comment; cut 3-5 Shorts (30-60 s, own hook) into 03; Jarvis approves; Sunday Jarvis report covers both channels.
- Claude-to-Claude email: subjects start `[LEONIDA]` (SHORTS IN QUEUE / LONG VIDEO READY / QUESTION - <topic>); Jarvis replies APPROVED or FIX NEEDED. Address is in the Playbook doc.
- Quality: never edit from a 360p `videoplayback.mp4`; source ≥1080p; Shorts 1080×1920 <60 s, long 1920×1080+; verify with ffprobe; never ship a draft render; hook in 2 s, captions, no dead air; only clip creators who allow it, credit them.
- Content: Easter eggs, shootouts, map secrets, wild moments. Never invent facts, leaks, dates or quotes; label rumors. Voice: faceless hype narrator, natural, no AI filler.
- Cross-linking: Shorts pin "Full video on @<long channel>"; channels link each other; long videos end "Daily Shorts on @<shorts channel>".
- Rules: no spending without Justin's or Nick's OK; don't post unless the channel owner says so; never claim done/posted unless true; only touch the shared folder.

## GTA 6 Story Mode episodes (Episode Format doc)
- 16:9 recaps cut from real gameplay, 2-3 min, one per day ~4:00 PM Central, long-video channel, same Story Mode playlist.
- Ep 1 "How Jason Met Lucia" (https://youtu.be/g95m1T0ifzo, 2:53). Ep 2 "Why Lucia Went to Prison" (3:02). Ep 3 teased: "Bricks From the Sky".
- Structure: cold open 5-10 s (1-2 lines, hard cut) → 3 s newspaper title card (whoosh + low hit) → story strictly in order → 7 s end screen. Hard cuts; 0.25 s dip at scene changes; 0.45 s fade for big shifts.
- **No narrator, no music bed.** Game audio only; game's burned-in subtitles are the script. Bleep swears (1 kHz) and pixelate them in subtitles. No child's name in title/thumbnail.
- Footage: @MKIceAndFire no-commentary 4K walkthrough Part 1 (https://www.youtube.com/watch?v=YDNs_sPEcJc). Credit on screen ("Gameplay: @MKIceAndFire" tab, covers watermark ~x1530-1873, y984-1016) and in description. 58 px letterbox bars; brand elements go in the bars; subtitles at y≈900-990.
- Palette: PAPER #FEF3D5, MAGENTA #D4114D, TAPE #FBD601, INK #111111, NIGHT #0F082A. Fonts: Kaushan Script (wordmark), Montserrat 900/800, Archivo Black (EXTRA!), Old Standard TT Bold (kicker "EVENING EDITION • GTA 6 STORY MODE • LATE CITY FINAL").
- Export: 1920×1080, 60 fps, H.264 High 4.2 yuv420p bt709, libx264 slow CRF 13, maxrate 30M; AAC 48 kHz 320k; +faststart; -14 LUFS / -2 dBTP. File: `YYYY-MM-DD_LeonidaFP_EpNN_<Slug>.mp4` (planned post date) plus `_thumbnail.jpg` (1280×720) and metadata txt.
- Thumbnail: punched-in still, cream script tag top-left, avatar ~140 px top-right, yellow tape "GTA 6 STORY MODE • EPISODE N", 3-4 word yellow headline with black stroke (Ep1 HOW THEY MET, Ep2 SHE LEFT THE BABY).
- Title `GTA 6 Story Mode Ep. N: <Title>`. Description: "Episode N of the GTA 6 story, told in order." → factual present-tense plot → previous/next → chapters → credit block → subscribe line → `#GTA6 #GTAVI #GTA6StoryMode`. Studio: Gaming, not made for kids, English.
- Unknowns (don't guess): playlist title, later source URLs, whether each episode needs Justin's approval, how teaser Shorts are handled.

## Not imported
The "Faceless Empire" claude.ai chat is not reachable from here (cloud sessions can't read other claude.ai chats). Paste its key content into a session to add it.
