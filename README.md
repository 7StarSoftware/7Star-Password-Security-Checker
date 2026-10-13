# 7Star Password Security Checker

A static, responsive password-strength checker ready for Vercel.

## Deploy to Vercel
1. Extract this ZIP.
2. Upload the three files (`index.html`, `style.css`, `script.js`) to a GitHub repository, keeping them in the repository root.
3. In Vercel, choose **Add New → Project**, import that repository, and deploy.
4. No build command or environment variables are needed. Vercel can deploy this as a static site.

You can also use Vercel CLI from this folder:
- `npm i -g vercel`
- `vercel`
- Follow the prompts.

## Privacy
Password analysis is performed in the browser. This implementation does not send or store the password. The score is an educational heuristic, not a guarantee of security or a breached-password check.
