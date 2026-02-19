# DnD UI

React + TypeScript + Vite frontend for browsing DnD characters, items, and monsters.

## Local Development

```bash
npm ci
npm run dev
```

## Environment Variables

The frontend API base URL is configured at build time:

- `VITE_API_BASE_URL`

Examples:

- local dev in `.env` (ignored)
- production in `.env.production`

When deploying from CI, make sure your production build receives a value for `VITE_API_BASE_URL`.

## Build & Validate

```bash
npm run typecheck
npm run lint
npm run build
```

## AWS CDK Deployment (S3 + CloudFront)

The repository includes CDK infrastructure in `infra/` for deploying the static Vite build to a private S3 bucket fronted by CloudFront.

### What the stack creates

- Private S3 bucket for static assets
- CloudFront distribution with Origin Access Control (OAC)
- SPA fallback for deep links (`403/404 -> /index.html`)
- Long-lived caching for hashed assets and no-cache for `index.html`

### One-time AWS account bootstrap

Run once per account/region:

```bash
cd infra
npm install
npx cdk bootstrap aws://<AWS_ACCOUNT_ID>/<AWS_REGION>
```

### Deploy manually

```bash
# from repo root
npm run build

# deploy infra
cd infra
npm install
npx cdk deploy FrontendStack
```

### CI/CD with GitHub Actions

Workflow file: `.github/workflows/deploy-frontend.yml`

Required GitHub configuration:

- **Secret:** `AWS_DEPLOY_ROLE_ARN`
- **Variable:** `AWS_REGION` (optional; defaults to `us-east-2`)

The IAM role in `AWS_DEPLOY_ROLE_ARN` should trust GitHub OIDC (`token.actions.githubusercontent.com`) and allow CDK deployment permissions for CloudFormation, S3, CloudFront, and IAM pass-role as needed.

The workflow:

1. Builds the Vite app (`dist/`)
2. Synthesizes CDK
3. Deploys `FrontendStack`

## Notes

- This setup uses the CloudFront default domain.
- If you add a custom domain later, add Route53 + ACM (certificate in `us-east-1`) to the stack.
