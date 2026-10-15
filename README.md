# Urban Focus demo website

A Portuguese (PT-PT) website for Urban Focus, a company in Vila Franca de Xira
that buys homes directly in Lisboa and the Margem Sul. It is a demo for a real
prospect: their name, phone, address, INPI trade mark (n.º 758420) and the T2
in Castanheira do Ribatejo are real, from their Facebook page and INPI.
Everything on it goes into the CRM account **Urban Focus**.

- **"Peça a sua proposta"** (hero form): arrives in the CRM Inbox as a new
  lead, with location, type of home and situation.
- **Avaliação gratuita** (booking): service, person, day and time, booked into
  the `urbanfocus` calendar with a confirmation email.
- **"Próxima avaliação livre"** under the hero is read live from the diary.
- **Imóveis à venda** is read live from the CRM: every home published to the
  website in the account shows here, and a new price, a reservation or a sale
  shows within 20 seconds. Needs `LISTINGS_KEY` (below); without it the page
  shows the T2 written into `index.html`.
- WhatsApp button to their real number.

No framework and no install. `build.mjs` copies `src/` to `dist/` and writes
`dist/config.js`.

## Vercel

Import this repository, framework preset **Other**. Nothing else is needed:
the build settings are in `vercel.json` and the defaults point at the live CRM.
Environment variable `LISTINGS_KEY`: in the CRM, Urban Focus account,
**Properties › Website**, create the website key (`pk_…`) and paste it here.
Optional: `TRACK_KEY`, `CRM_API_URL`, `CRM_APP_URL`, `BOOKING_SLUG`,
`SITE_SLUG` (see `build.mjs`).

The CRM account must exist first. On the server:
`cd ~/autisync && docker compose exec crm-backend npm run demo:urbanfocus`
(CRM commit fe5d41b or later). It creates the calendar and the published CRM
site whose contact form this page posts to.

## Before a demo

Run the same command with `-- --refresh` so the diary and boards hold this
week's dates. Test leads and bookings land in the account like real ones;
delete them in the CRM afterwards.

## Locally

```
CRM_API_URL=http://localhost:3001/api node build.mjs && npx serve dist
```

The source of truth is `demo-sites/sites/urbanfocus` and `demo-sites/shared`
in crm-autisync-original; copy changes across when either side changes.
