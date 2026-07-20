# Home

The marketing landing Page. Its single **Profile** action demonstrates a conditional cross-Page
flow edge: depending on the `authenticated` control it exits to [Auth](../../account/Auth/README.md)
(signed out) or [Account](../../account/Account/README.md) (signed in).

## States

- **Guest** (`authenticated: false`) — default.
- **Member** (`authenticated: true`) — reachable in review through the dev-mode-only **Sign in**
  action (`kind: "state"` edge), which exists purely to demonstrate the internal-transition edge
  kind without a real auth backend.

## Route

Authored production route: `/`.
