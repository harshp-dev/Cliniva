# Supabase Email Template

This folder contains the Cliniva-auth email template for Supabase Authentication.

## Files

- `auth-template.html` - base email template using Cliniva brand colors

## How to add your logo

1. Host the logo at a public URL. Options:
   - Your production domain, e.g. `https://cliniva.com/logo/Logomark.svg`
   - Supabase Storage with a public bucket
   - Any CDN URL you control

2. Replace `{{LOGO_URL}}` in `auth-template.html` with your hosted logo URL.

## How to use in Supabase

1. Open Supabase Dashboard.
2. Go to Authentication -> Email Templates.
3. Choose the template (Confirm signup, Magic Link, Reset Password, etc.).
4. Paste the HTML from `auth-template.html`.
5. Replace the placeholders with Supabase variables:

- `{{TITLE}}` -> your email title text
- `{{MESSAGE}}` -> your email body text
- `{{ACTION_URL}}` -> Supabase URL variable for the template
- `{{ACTION_TEXT}}` -> button label such as "Confirm email" or "Reset password"

Supabase variables differ by template. Use the variables shown in the Supabase UI for that template.

## Example mapping

- Confirm signup email
  - `{{ACTION_URL}}` -> Supabase confirmation URL token
  - `{{ACTION_TEXT}}` -> "Confirm email"

- Reset password email
  - `{{ACTION_URL}}` -> Supabase recovery URL token
  - `{{ACTION_TEXT}}` -> "Reset password"
