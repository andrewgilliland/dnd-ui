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

## npm Compatibility Note

This repo currently uses React 19 with `visx`, and `visx` peer dependency ranges do not yet include React 19.

To keep local and CI installs consistent, the repository includes `.npmrc` with:

```ini
legacy-peer-deps=true
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

### CI/CD with AWS CodePipeline (CDK)

This repository uses a CDK pipeline stack (`FrontendPipelineStack`) to deploy from GitHub `main` using a CodeStar connection.

Required context values when deploying the pipeline stack:

- `connectionArn` (CodeStar connection ARN in the same region as the pipeline)
- `viteApiBaseUrl` (value used for frontend production build)

Optional context values:

- `repo` (defaults to `andrewgilliland/dnd-ui`)
- `branch` (defaults to `main`)

Deploy the pipeline stack:

```bash
cd infra
npm install
npx cdk deploy FrontendPipelineStack \
	-c deployPipeline=true \
	-c connectionArn=<CODESTAR_CONNECTION_ARN> \
	-c viteApiBaseUrl=<VITE_API_BASE_URL> \
	-c repo=andrewgilliland/dnd-ui \
	-c branch=main
```

The pipeline synth step builds both app and infra, then deploys `FrontendStack`.

## Notes

- This setup uses the CloudFront default domain.
- Current distribution URL: https://dry2eo3bwi7nf.cloudfront.net/
- If you add a custom domain later, add Route53 + ACM (certificate in `us-east-1`) to the stack.
