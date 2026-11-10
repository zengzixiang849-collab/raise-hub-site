# AI API and Agent Workflow Report

## 1. Scope and status

This report records practical learning from the RAISE Hub experiments. It distinguishes successful connections and workflows from troubleshooting observations and future recommendations.

## 2. Accounts, subscriptions, and API keys

An Anthropic API key is a credential for programmatic requests billed to an Anthropic Console workspace. It is **not** a Claude account, Claude.ai subscription, or a login that provides access to the Claude desktop application.

The professor-provided key was time-limited and, according to the project communication, expired on 7 November 2026. The key value is not stored in this repository or handover package.

## 3. Roles of the tools used

| Tool | Role in the work | Status |
|---|---|---|
| Anthropic API | Model access through a billed API workspace | Tested through a harness; expired credential excluded |
| Claude Code CLI | Code-oriented terminal harness for Claude models | Installed and explored; direct use was blocked by authentication/billing-route mismatch |
| DeepSeek Harness (DSH) | Desktop harness used to connect to the Anthropic API and send model requests | Connection demonstrated; later reliability was affected by network timeouts |
| Codex | Repository implementation, file editing, design iteration, verification, browser review, and handover preparation | Used successfully |
| CreateAI | ASU teaching tool and workshop subject for building course assistants without coding | Workshop/platform scope; not an API-key harness in this project |
| Vercel | Review deployment of the static website | Used successfully |

## 4. Observed experiment path

### Completed

1. Installed Claude Code CLI and confirmed that the command-line application could start.
2. Stored the Anthropic key temporarily in a PowerShell session rather than in source files.
3. Identified that Claude Code’s interactive sign-in path expected a Claude subscription, Anthropic Console account, or third-party platform and did not simply treat the supplied key as a Claude account.
4. Connected the Anthropic API to DSH and received a successful test response. The harness reported the provider/model as `anthropic/claude-sonnet-4-5` during testing.
5. Confirmed that the API endpoint could return data when the correct route and credential were used.
6. Used an agent-assisted development workflow to build and review the RAISE Hub site.

### Problems encountered

- Claude account registration/access restrictions did not prevent API use, but they did prevent treating the API key as a Claude.ai login.
- Claude Code showed `Credit balance too low` through one selected route. This indicated a billing/workspace mismatch or insufficient credit for that route, not proof that the key was unrelated to Anthropic models.
- One endpoint test returned HTTP 404, which indicated an incorrect URL/path rather than an invalid key by itself.
- DSH requests sometimes timed out after the initial successful connection.
- School VPN access improved the available network route, but connection reliability still varied.
- Harness configuration, model availability, request duration, and streaming settings all affected perceived reliability.

## 5. Working security pattern

Use a temporary environment variable in the current terminal session:

1. Read the secret through a hidden prompt.
2. Set `ANTHROPIC_API_KEY` only for that process/session.
3. Start the approved harness from the same session.
4. Remove the temporary variable or close the terminal after use.

Do not:

- paste keys into chat messages, screenshots, source code, command history, scripts, issue trackers, or documentation;
- commit `.env` files or application credential folders;
- reuse a key that has been publicly exposed;
- transfer API keys as part of an internship handover.

If a key is exposed, the credential owner should revoke/rotate it. Hiding or deleting a screenshot does not reverse an exposure that has already occurred.

## 6. Recommended operational configuration

**Proposed for future work:**

- Use a maintained coding harness that officially supports the selected provider and model.
- Set a request timeout of approximately 120 seconds for long code or analysis requests.
- Enable streaming so the user can see incremental output and distinguish slow generation from a failed connection.
- Start with a low-cost one-line request, then test a small file task before a long agent run.
- Record provider, model, endpoint, date, request purpose, success/failure, and non-sensitive error text.
- Separate model access from deployment credentials and keep both outside the repository.
- Use the institutional VPN only when required by network policy; do not treat the VPN as a substitute for correct endpoint and billing configuration.

These settings are operating recommendations, not a claim that every DSH timeout was eliminated.

## 7. Recommended RAISE development workflow

1. Define the educational task and what must remain under human control.
2. Select a harness that supports the authorised API provider.
3. Load only the minimum non-sensitive context.
4. Ask the model to propose or implement a bounded change.
5. Run deterministic checks, inspect the diff, and test in a real browser.
6. Record limitations and unresolved decisions.
7. Obtain the responsible faculty member’s approval before publication or learner use.

The central lesson is that a successful model response is only evidence of connectivity. It is not evidence that content is accurate, fair, secure, or ready for deployment.

