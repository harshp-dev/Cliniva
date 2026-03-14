# Auth Callback

This route exchanges Supabase auth `code` for a session and sets cookies.

After exchange, it redirects to a role dashboard using `next` if provided.

Allowed redirect targets:
- `/patient/dashboard`
- `/provider/dashboard`
- `/admin/dashboard`

Make sure Supabase Auth settings include this URL as a redirect:
- `http://localhost:3000/auth/callback`
- your production URL `https://your-domain.com/auth/callback`
