# Security Policy

## Supported Versions

This project is actively maintained on the `main` branch.

## Reporting a Vulnerability

Please do not open public issues for security reports.

Report privately by creating a GitHub security advisory or by emailing the maintainer with:
- A clear description of the issue
- Reproduction steps
- Potential impact
- Suggested mitigation (if known)

We aim to acknowledge reports within 72 hours and provide a mitigation plan as quickly as possible.

## Security Best Practices

- Never commit secrets, tokens, or private keys.
- Use `.env` files locally and commit only `.env.example` placeholders.
- Keep dependencies updated and patch critical vulnerabilities quickly.
- Run least-privilege deployments and avoid exposing internal services publicly.
