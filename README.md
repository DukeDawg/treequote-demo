# TreeQuote — concept site

A working concept for **TreeQuote.com**: an arborist-led tree service broker. A homeowner describes the job, adds a few photos, and sees a ballpark price in about two minutes. An arborist scopes the job, and TreeQuote matches it to one vetted, insured local crew. The crew pays TreeQuote a referral fee on completed jobs.

**Live demo:** https://dukedawg.github.io/treequote-demo/

> This is a concept preview. Forms validate and respond, but nothing is sent anywhere, and the site is set to `noindex` so it stays out of search results.

## Pages

| Page | What it shows |
|---|---|
| [`index.html`](index.html) | Homeowner landing page: quick-start service picker, how it works, AI photo estimate, services with typical prices, comparison with lead-selling sites, cost guide, FAQ |
| [`quote.html`](quote.html) | Five-step quote flow with a **live ballpark estimate** that updates on every answer: service → details → photos → timing → contact → confirmation |
| [`pros.html`](pros.html) | Supply side: why tree crews join, how matching works, requirements, and a crew application |

## What works today

- The estimator prices removal, trimming, stump grinding, planting, storm/emergency, and health checks from height, trunk size, what's nearby, condition, access, add-ons, and timing.
- Photo upload with previews (photos stay in the browser). "Try it with sample photos" shows the flow without your own pictures.
- The range tightens when photos are added, and an estimate-confidence meter fills as the request gets more complete.
- Deep links from the home page carry the service and ZIP into the quote flow (`quote.html?service=removal&zip=30305`).
- Responsive layout from phone to desktop. No build step; plain HTML, CSS, and JavaScript.

## What is simulated

- **AI photo read.** The checklist animation on the photos step shows what a real vision-model check would do. It does not analyze the image.
- **Submissions.** Quote requests and crew applications stop at a confirmation screen.
- **Prices.** Ranges come from published 2025–26 U.S. cost guides. They are a starting point, not a pricing engine. Tune them in `assets/js/quote.js` (`HEIGHT`, `TRUNK`, `NEARBY`, and related tables) once real local job data exists.

## Turning it into the real thing

1. **Capture requests.** Send the form to a backend (a form service, a small serverless function, or a field-service tool such as Jobber or Housecall Pro) and store photos.
2. **Alert the arborist.** Text the arborist on every new request with the photos and the computed ballpark.
3. **Real AI photo read.** Run uploaded photos through a vision model on the server to estimate height, trunk width, and hazards, then show the arborist the result to confirm.
4. **Crew portal.** Let crews accept or pass on scoped jobs and submit their firm quote.
5. **Referral fee.** Track completed jobs and invoice crews monthly, or split payments automatically with a payments platform.
6. **Local search.** Add city/service pages (for example, "tree removal in Decatur"), a Google Business Profile, and real customer reviews.
7. **Legal basics.** Add terms and a privacy policy, and check state rules for home-improvement referral services and contractor licensing.

## Use the treequote.com domain

GitHub Pages can serve this site on a custom domain:

1. Add a `CNAME` file containing `treequote.com` to the repo root.
2. At the domain registrar, point the apex domain to GitHub Pages' A records and `www` to `dukedawg.github.io` (see GitHub's "Managing a custom domain for your GitHub Pages site" guide).
3. Turn on **Enforce HTTPS** in the repo's Pages settings.

Remove `<meta name="robots" content="noindex">` from each page when the site goes live.

## Run locally

```bash
python3 -m http.server 8765
```

Then open http://localhost:8765.

## Credits

Photos from [Unsplash](https://unsplash.com) (Unsplash License). Fonts: Fraunces and Inter from Google Fonts.
