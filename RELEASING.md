# Releasing

This repository is prepared for public release but no registry publication is implied by its presence. Never publish before the matching API and secrets features have passed staging verification. The SDK does not deploy or configure the service.

## GitHub setup (maintainer)

Create an empty **public** repository named runnee-sdk-js under `itzBqa` (or update all repository URLs first). From the prepared SDK folder:

```sh
git init -b main
git add .
git commit -m "Initial public SDK release"
git remote add origin https://github.com/itzBqa/runnee-sdk-js.git
git push -u origin main
```

Review `git diff --cached` before committing. Never upload the parent application repository. Enable GitHub private vulnerability reporting, dependency alerts and branch protection. Create the `npm` GitHub Actions environment; restrict it to main and require a maintainer review if available for your account. The workflow only publishes when manually requested with publish=true on main. Ordinary pushes and tags run CI only. A manual run with publish=false builds downloadable artifacts without publishing.

## Versioning

Use semantic versioning. Update all version constants and CHANGELOG.md together. Search for the previous version in tracked files, including HTTP User-Agent strings; review the diff and regenerate distribution files. The workflow checks the expected version before building. Once published, treat versioned artifacts as immutable. After publication, tag the exact tested commit `vVERSION` and attach checksums and artifacts to a GitHub release.

## npm

1. Confirm you control the `@runnee` npm scope and that `@runnee/sdk` is available: `npm view @runnee/sdk`. A not-found response is not a reservation. If the scope is unavailable, rename the package, imports, lockfile and documentation consistently before publication.
2. Run `npm ci`, `npm run build`, `npm test`, `npm run typecheck`, `npm run format:check` and `npm pack --dry-run`. Inspect the file list; only client output and public release documents belong in the package.
3. For a new package, first authenticate locally with `npm login` using an authorized account with 2FA, then explicitly publish the inspected package: `npm publish --access public --provenance=false`. This is a manual first-release step; do not put login credentials into this repository.
4. In npm package Settings → Trusted publishing, add GitHub Actions: owner `itzBqa`, repository `runnee-sdk-js`, workflow `release.yml`, environment `npm`; allow publishing.
5. Future releases: Actions → Release → Run workflow on main; enter the new expected version and select publish=true. The job uses Node 24 and npm 11 with OIDC/provenance, without an NPM_TOKEN.
6. Verify installation into a clean project with `npm install @runnee/sdk@VERSION`, ESM import, CommonJS require and TypeScript declarations.

See [npm trusted publishers](https://docs.npmjs.com/trusted-publishers/).
