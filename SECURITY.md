# Security policy

Zahrady Prahy is a static, client-side atlas: there is no backend, no
database, no user accounts and no form that sends data anywhere. The attack
surface is therefore small, but not zero: the page reads URL parameters,
stores two preferences in `localStorage`, links to external sites and ships
third-party dependencies.

## Reporting a vulnerability

Please do **not** open a public issue for a security problem.

Write to **<martin@usnea.ngo>** with:

- a description of the issue and the affected file or URL,
- steps to reproduce or a proof of concept,
- the impact as you see it.

You will get an acknowledgement within a few days. This is a small volunteer
nonprofit project, so there is no bug bounty, but reports are taken
seriously, fixed as quickly as possible and credited in the release notes if
you wish.

## Scope

In scope:

- the application code in this repository (`app/`, `components/`, `lib/`),
- the production deployment at <https://zahrady-prahy.vercel.app>,
- handling of URL parameters (`?q`, `?zahrada`/`?garden`, `?typ`, `?filtry`),
- the optional WebMCP tool in `lib/webmcp.ts` (read-only by design).

Out of scope:

- the external garden websites the atlas links to,
- vulnerabilities in dependencies that have no effect on this application
  (report those upstream; dependency updates are still welcome as pull
  requests),
- the hosting platform itself.

## Supported versions

Only the `main` branch and the current production deployment are supported.
