# Infomaniak Infrastructure Cost Analysis

> Last updated: January 2025

## Overview

Cost analysis for hosting Easy-Lehrer on Infomaniak with Swiss data residency. Includes VPS, database, S3-compatible storage, domain, and email.

---

## VPS Hosting (Dokploy + App)

| Plan | Specs | Monthly |
|------|-------|---------|
| **Lite 2C 4G** (recommended) | 2 vCPU, 4GB RAM, 60GB SSD | **€7.20** (~CHF 7) |
| Lite 4C 8G (scaling) | 4 vCPU, 8GB RAM, 160GB SSD | €18.00 |
| Lite 6C 12G (high load) | 6 vCPU, 12GB RAM, 240GB SSD | €50.00 |

**Features included:**
- Unlimited traffic at 500 Mb/s
- AMD EPYC processors
- NVMe SSD storage
- Swiss datacenter (Geneva/Zurich)

---

## PostgreSQL Database

| Option | Description | Monthly |
|--------|-------------|---------|
| **Self-hosted on VPS** | Run PostgreSQL in Docker on VPS | **€0** (included) |
| Managed DBaaS | Infomaniak managed PostgreSQL with HA | ~€15-30 (estimate) |

**Recommendation:** Start with self-hosted PostgreSQL on the VPS. Move to managed DBaaS when you need:
- High availability (automatic failover)
- Managed backups and point-in-time recovery
- Horizontal read replicas

---

## S3-Compatible Object Storage

| Resource | Rate | Notes |
|----------|------|-------|
| Storage | **€0.01/GB/month** | ~CHF 0.01/GB |
| Egress | **Free** up to 10TB/month | No bandwidth fees |
| Requests | **Free** | GET, PUT, DELETE all free |

### Storage Cost Examples

| Volume | Monthly Cost |
|--------|--------------|
| 10 GB | €0.10 |
| 50 GB | €0.50 |
| 100 GB | €1.00 |
| 500 GB | €5.00 |
| 1 TB | €10.00 |

**Key advantage:** Free egress up to 10TB/month. Cloudflare R2 and Infomaniak are the only major providers with free egress.

---

## Domain Registration

| Domain | 1st Year | Renewal |
|--------|----------|---------|
| **.ch** | CHF 9.90 | CHF 11.90/year |
| .com | CHF 12.90 | CHF 17.90/year |
| .swiss | CHF 99.00 | CHF 99.00/year |

**Included with domain:**
- Free email address
- DNS management
- WHOIS privacy

---

## Email (Service Mail)

| Plan | Mailboxes | Storage | Monthly |
|------|-----------|---------|---------|
| **Free (with domain)** | 1 | Unlimited | **€0** |
| Starter | 5 | Unlimited | €1.50 |
| Pro | Unlimited | Unlimited | €6.58 |

**Features:**
- Swiss-hosted email infrastructure
- Webmail + IMAP/SMTP
- Spam/virus protection
- Calendar and contacts

---

## Total Cost Estimates

### Launch Phase (Minimum Viable)

| Service | Monthly |
|---------|---------|
| VPS Lite 2C 4G | €7.20 |
| PostgreSQL (self-hosted) | €0 |
| Object Storage (10GB) | €0.10 |
| Email (free tier) | €0 |
| **Monthly Total** | **€7.30** (~CHF 7.50) |

| One-time / Annual | Cost |
|-------------------|------|
| Domain .ch (1st year) | CHF 9.90 |

**First year total: ~CHF 100**

### Growth Phase (50GB storage)

| Service | Monthly |
|---------|---------|
| VPS Lite 2C 4G | €7.20 |
| PostgreSQL (self-hosted) | €0 |
| Object Storage (50GB) | €0.50 |
| Email (free tier) | €0 |
| **Monthly Total** | **€7.70** (~CHF 8) |

**Annual total: ~CHF 110**

### Scale Phase (100GB+, higher traffic)

| Service | Monthly |
|---------|---------|
| VPS Lite 4C 8G | €18.00 |
| Managed PostgreSQL DBaaS | ~€20.00 |
| Object Storage (100GB) | €1.00 |
| Email Pro | €6.58 |
| **Monthly Total** | **~€45** (~CHF 45) |

**Annual total: ~CHF 550**

---

## Comparison with Alternatives

| Stack | Monthly Cost | Swiss Data | Free Egress |
|-------|--------------|------------|-------------|
| **Infomaniak (VPS + S3)** | ~€8 | Yes | Yes (10TB) |
| Hetzner + Cloudflare R2 | ~€5 | No (Germany) | Yes |
| DigitalOcean + Spaces | ~€12 | No | No |
| AWS EC2 + S3 | ~€30-50 | No | No |
| Vercel + Supabase + R2 | ~€25+ | No | Partial |
| Exoscale (Swiss) | ~€15-20 | Yes | No |

---

## Recommendations

1. **Start with Lite 2C 4G VPS** (€7.20/month)
   - Sufficient for Next.js + PostgreSQL + Dokploy
   - Can scale up anytime without downtime

2. **Self-host PostgreSQL initially**
   - Run in Docker alongside the app
   - Daily backups to Object Storage
   - Move to DBaaS when you need HA

3. **Use Object Storage from day one**
   - Implement S3 storage as planned in `spec/s3-storage.md`
   - Future-proof architecture
   - Negligible cost at low volume

4. **Get .ch domain with free email**
   - Professional Swiss presence
   - Free email included

---

## Sources

- [Infomaniak VPS Prices](https://www.infomaniak.com/en/hosting/vps-cloud/prices)
- [Infomaniak Public Cloud](https://www.infomaniak.com/en/hosting/public-cloud/prices)
- [Object Storage Pricing](https://pcr.cloud-mercato.com/providers/infomaniak/object-storage/infomaniak-os/pricing)
- [Domain Pricing](https://www.infomaniak.com/en/domains/prices/ch)
- [Service Mail Pricing](https://www.infomaniak.com/en/ksuite/service-mail/prices)
- [VPSBenchmarks Infomaniak](https://www.vpsbenchmarks.com/hosters/infomaniak)
