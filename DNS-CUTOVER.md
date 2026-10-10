# CameraBoss DNS cutover — preparation only

Prepared 2 October 2026; reviewed 7 October 2026. **BLOCKED DRAFT: do not
change DNS until the gates in LAUNCH-READINESS-2026-10-07.md are resolved.**
John has asked for the website cutover once the full checks pass. The
marketing site and client-gallery subdomain are separate.

## Confirmed ownership and current service

Nominet's registry record identifies **101domain GRS Ltd**, registrar handle
101DOMAIN. The authoritative nameservers are **nsa.whogohost.com** and
**nsb.whogohost.com**. This does not establish which customer account or
reseller portal controls the DNS zone. Confirm that portal with the owner,
and check the actual registrar account for any transfer in progress. The
registry's `client transfer prohibited` status is a lock, not proof that no
transfer has been requested.

The current public records rechecked on 7 October are:

| Name | Type | Current value |
| --- | --- | --- |
| cameraboss.co.uk | A | 104.16.185.173 |
| www.cameraboss.co.uk | CNAME | domain.pixieset.com. |
| gallery.cameraboss.co.uk | CNAME | domain.pixieset.com. |

Cached remaining TTLs were approximately 11,400 seconds on 2 October. The actual zone TTL
must be read from the DNS account before planning a change. Capture the full
zone first, including A/AAAA, CNAME, MX, TXT, CAA, DNSSEC and verification
records. The table is an observation, not a substitute for that backup.

## Vercel's current recommendations

At the last authenticated configuration check on 2 October, both
cameraboss.co.uk and www.cameraboss.co.uk were attached to the CameraBoss
`website` project, with the apex set to redirect to www. They were marked
misconfigured because they pointed to Pixieset. This run could not read back
the current Domains panel, so that state must be confirmed again.

The authenticated domain-configuration API returned these exact preferred
recommendations for both names:

- IPv4, rank 1: `216.198.79.1`, `64.29.17.1`.
- CNAME, rank 1: `cd7b3284add1af60.vercel-dns-017.com.`.
- Lower-priority fallbacks: IPv4 `76.76.21.21`; CNAME `cname.vercel-dns.com.`.

**Before execution, read the project's Domains panel again and record the
specific apex A record/set and www CNAME it requests.** Do not guess whether
the two preferred IPv4 values are alternatives or a required record set.
Recommendations can change. Do not mix the preferred and fallback values.
Save that readback beside the zone backup before making any change.

## Order of operations on the later cutover day

1. Resolve commercial hosting, confirmed prices/offers, operational enquiry
   receipt and agency publication testing. Merge the reviewed PR normally
   into main and verify its production deployment is Ready. Do not use an
   unreviewed preview build as the production baseline.
2. Confirm the real DNS account, registrar/transfer status and rollback
   access. Export the zone and screenshot the current apex/www records.
   Retain Pixieset access and the subscription.
3. Lower only the apex/www record TTLs to 300 seconds if the provider allows
   it. Wait at least the previous configured TTL before cutover; lowering a
   TTL does not expire already cached records.
4. Re-read Vercel's exact requested records. Replace only the conflicting
   apex/www website records with that verified set. Account for any existing
   AAAA records rather than leaving a competing IPv6 route to Pixieset.
   Keep nameservers, gallery, mail, TXT and other unrelated records unchanged.
5. Confirm Vercel reports both domains correctly configured and HTTPS
   certificates are valid. Check DNS against the authoritative nameservers
   and at least two public resolvers. Test the apex-to-www redirect and HTTPS
   on both names from another network.
6. Run the full legacy URL/redirect check against the public domain. Check
   homepage, portfolio, pricing, contact, blog images, robots.txt, sitemap
   and canonical URLs. Confirm the enquiry destination and notification
   workflow. Check an existing gallery.cameraboss.co.uk client link still
   reaches Pixieset.
7. Watch actual form receipt and HTTP errors. Restore normal TTLs after the
   site has remained healthy for at least a day. Update Search Console only
   after the live canonical site and sitemap are confirmed.

## Rollback to Pixieset

If HTTPS, page routing, imagery or enquiries fail materially, restore the
saved apex/www records in the **same confirmed DNS account**, using the zone
backup. The observed fallback was apex A `104.16.185.173` and www CNAME
`domain.pixieset.com.`; use the backup/current Pixieset instructions if these
have changed. Keep gallery and mail records untouched. Verify DNS, HTTPS and
the Pixieset site from another network. Cached answers mean recovery can
take the effective TTL to reach everyone.

Vercel Instant Rollback is a separate option for a bad website deployment.
It does not revert DNS, repository content or the external CRM. Restore the
source content too before another deployment.

Evidence: audit/dns-preflight-2026-10-02.json.

[Nominet registry record](https://rdap.nominet.uk/uk/domain/cameraboss.co.uk),
[Vercel domain setup](https://vercel.com/docs/domains/working-with-domains/add-a-domain),
[Vercel Instant Rollback](https://vercel.com/docs/instant-rollback).
