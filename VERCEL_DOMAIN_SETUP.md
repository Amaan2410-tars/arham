# 🌐 Connect Custom Domain to Vercel

## Step-by-Step Guide

### Step 1: Add Domain in Vercel Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project (e.g., `arhamstore`)
3. Go to **Settings** → **Domains**
4. Click **Add Domain**
5. Enter your domain name (e.g., `arhamstationary.com` or `www.arhamstationary.com`)
6. Click **Add**

### Step 2: Configure DNS Records

Vercel will show you the DNS records you need to add. There are two options:

#### Option A: Apex Domain (e.g., `arhamstationary.com` - without www)

**For most domain providers:**
- **Type**: `A`
- **Name**: `@` (or leave blank, or your root domain)
- **Value**: `76.76.21.21` (Vercel's IP address)
- **TTL**: `3600` (or default)

**Alternative (CNAME flattening):**
- Some providers support CNAME at root (e.g., Cloudflare)
- **Type**: `CNAME`
- **Name**: `@`
- **Value**: `cname.vercel-dns.com`
- **TTL**: `3600`

#### Option B: Subdomain (e.g., `www.arhamstationary.com`)

- **Type**: `CNAME`
- **Name**: `www`
- **Value**: `cname.vercel-dns.com`
- **TTL**: `3600` (or default)

### Step 3: Add DNS Records in Your Domain Provider

The steps vary by provider. Here are common ones:

#### GoDaddy
1. Log in to GoDaddy
2. Go to **My Products** → **DNS** (or **Manage DNS**)
3. Click **Add** to create a new record
4. Enter the values from Vercel
5. Click **Save**

#### Namecheap
1. Log in to Namecheap
2. Go to **Domain List** → Select your domain → **Manage**
3. Go to **Advanced DNS** tab
4. Click **Add New Record**
5. Enter the values from Vercel
6. Click **Save**

#### Cloudflare
1. Log in to Cloudflare
2. Select your domain
3. Go to **DNS** → **Records**
4. Click **Add record**
5. Enter the values from Vercel
6. Click **Save**

#### Google Domains
1. Log in to Google Domains
2. Select your domain
3. Go to **DNS** → **Custom resource records**
4. Click **Add**
5. Enter the values from Vercel
6. Click **Save**

#### Other Providers
- Look for "DNS Management", "DNS Settings", or "Name Servers"
- Add the records as shown in Vercel

### Step 4: Wait for DNS Propagation

- DNS changes can take **5 minutes to 48 hours** to propagate
- Usually takes **15-30 minutes** for most providers
- Vercel will show the status:
  - ⏳ **Pending** - Waiting for DNS
  - ✅ **Valid** - Domain is connected
  - ❌ **Invalid** - Check DNS records

### Step 5: Verify Domain in Vercel

1. Go back to Vercel → **Settings** → **Domains**
2. You'll see the status:
   - **Valid Configuration** ✅ - Ready to use!
   - **Pending** ⏳ - Still propagating
   - **Invalid Configuration** ❌ - Check your DNS records

### Step 6: SSL Certificate (Automatic)

- Vercel automatically provisions SSL certificates via Let's Encrypt
- Takes a few minutes after domain is verified
- Your site will be available at `https://yourdomain.com`

---

## Common Configurations

### Configuration 1: Both www and non-www

**Add both domains in Vercel:**
- `arhamstationary.com` (apex)
- `www.arhamstationary.com` (subdomain)

**DNS Records:**
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**Redirect Setup (in Vercel):**
- Go to **Settings** → **Domains**
- Set one as primary (e.g., `www`)
- Vercel can redirect the other automatically

### Configuration 2: Only www

**Add in Vercel:**
- `www.arhamstationary.com`

**DNS Record:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### Configuration 3: Only apex (no www)

**Add in Vercel:**
- `arhamstationary.com`

**DNS Record:**
```
Type: A
Name: @
Value: 76.76.21.21
```

---

## Troubleshooting

### Domain shows "Invalid Configuration"

1. **Check DNS records:**
   - Verify the exact values match what Vercel shows
   - Check for typos
   - Ensure TTL is set correctly

2. **Wait longer:**
   - DNS can take up to 48 hours
   - Use [whatsmydns.net](https://www.whatsmydns.net) to check propagation

3. **Clear DNS cache:**
   ```bash
   # Windows
   ipconfig /flushdns
   
   # Mac/Linux
   sudo dscacheutil -flushcache
   ```

### Domain not resolving

1. **Check DNS propagation:**
   - Visit [whatsmydns.net](https://www.whatsmydns.net)
   - Enter your domain
   - Check if DNS records are propagated globally

2. **Verify records:**
   - Use `dig` or `nslookup`:
     ```bash
     # Check A record
     dig arhamstationary.com
     
     # Check CNAME
     dig www.arhamstationary.com
     ```

3. **Check domain provider:**
   - Ensure domain is active
   - Check if domain is locked
   - Verify name servers are correct

### SSL Certificate not issued

- Wait 5-10 minutes after domain verification
- Check Vercel dashboard for SSL status
- If stuck, remove and re-add the domain

### Redirects not working

1. Go to **Settings** → **Domains** in Vercel
2. Click on the domain
3. Configure redirects:
   - Redirect apex to www (or vice versa)
   - Set primary domain

---

## Quick Checklist

- [ ] Domain added in Vercel dashboard
- [ ] DNS records added in domain provider
- [ ] DNS records match Vercel's requirements exactly
- [ ] Waited for DNS propagation (15-30 min minimum)
- [ ] Domain shows "Valid Configuration" in Vercel
- [ ] SSL certificate issued (automatic)
- [ ] Site accessible at `https://yourdomain.com`

---

## Current Vercel IP Addresses

**A Record (for apex domains):**
- `76.76.21.21`

**CNAME (for subdomains):**
- `cname.vercel-dns.com`

**Note:** These may change. Always use the values shown in your Vercel dashboard.

---

## Additional Resources

- [Vercel Domain Documentation](https://vercel.com/docs/concepts/projects/domains)
- [DNS Propagation Checker](https://www.whatsmydns.net)
- [Vercel Support](https://vercel.com/support)

---

## Example: Complete Setup for `arhamstationary.com`

1. **In Vercel:**
   - Add `arhamstationary.com`
   - Add `www.arhamstationary.com`

2. **In Domain Provider (e.g., GoDaddy):**
   ```
   A Record:
   Name: @
   Value: 76.76.21.21
   TTL: 3600
   
   CNAME Record:
   Name: www
   Value: cname.vercel-dns.com
   TTL: 3600
   ```

3. **Wait 15-30 minutes**

4. **Verify in Vercel:**
   - Both domains should show "Valid Configuration"

5. **Test:**
   - Visit `https://arhamstationary.com`
   - Visit `https://www.arhamstationary.com`
   - Both should work!

---

**That's it!** Your custom domain will be connected to Vercel. 🎉

