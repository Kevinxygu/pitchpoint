## Auth0 setup (SPA)

1. In Auth0, create a **Single Page Application**.
2. Allowed Callback URLs: `http://localhost:3000/dashboard`
3. Allowed Logout URLs: `http://localhost:3000`
4. Allowed Web Origins: `http://localhost:3000`
5. Create `frontend/.env.local` with:
   ```
   NEXT_PUBLIC_AUTH0_DOMAIN=your-tenant.us.auth0.com
   NEXT_PUBLIC_AUTH0_CLIENT_ID=your-client-id
   ```

## Local development

```bash
cd frontend
npm install
npm run dev
```

- Visit `http://localhost:3000` for the login/sign-up page.
- Successful auth redirects to `/dashboard`; use the logout button to return to the login page.
