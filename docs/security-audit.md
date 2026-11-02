# Pre-publication credential audit

Audit date: 2 November 2026. This report is a review checkpoint, not authorization to publish. The repository remains private; no merge, visibility change, deployment, paid API call, credential rotation, or history rewrite was performed.

## Pinned baseline and scope

Remote `main`: `02e1fe8f0938e7ce9f45f7c17abf6599c9dcaf59`.

A fresh mirror of every advertised remote Git ref contained one branch (`main`), zero tags, two reachable commits, thirteen trees, and twenty-nine unique historical file blobs. All reachable history was scanned, including deleted/changed content represented by those blobs. The current checkout contained nineteen tracked files, zero untracked files, and zero ignored local files before this change. The credits changes and this report were scanned again before the draft PR checkpoint; its exact head and CI status are recorded in the PR.

The scope includes source, configuration, environment example, docs, inline/code-drawn art, SVG asset, tests, workflow definitions, commit metadata, repository metadata, available Actions logs, and the repository surfaces described below. No unrelated credential stores, operating-system keychain, private account email settings, or external projects were read.

## Scanner and manual review

[Gitleaks](https://github.com/gitleaks/gitleaks) **8.30.1** was downloaded from its official release to a private temporary audit directory. Its archive SHA-256 matched the official release checksum. The binary was not added to the project or installed globally.

Scans used the default rules explicitly, full redaction, no repository allow-comment suppression, no ignore file, recursive decoding up to five levels, archive inspection up to three levels, and Git options `--all --full-history`. The working directory and downloaded GitHub surfaces were scanned separately. Credentials were not tested against providers or validated online.

Manual checks covered private-key blocks, provider credential patterns, credentials embedded in URLs, personal absolute paths, suspicious filenames, environment placeholders, server/client key isolation, static asset/configuration contents, and commit identities. The only credential-like tracked filename was `.env.example`, whose API key value is empty. Test values such as `test-only-placeholder` are intentional fixtures, not usable credentials. The server reads the real key from its environment; the browser never receives it. Environment files are ignored by Git.

Existing commit author/committer email metadata matches the email already exposed by the verified public GitHub profile. No email address is repeated here or added to contact UI. New contact links use only the public profile and repository Issues page.

## Repository and publication-surface results

- **Git history:** zero Gitleaks findings across the two baseline commits / twenty-nine historical blobs.
- **Current repository files:** zero Gitleaks findings; manual checks found no credential/private-key exposure or personal absolute paths.
- **Actions:** two existing completed workflow runs; both available log sets were downloaded and scanned (50,152 bytes in total). Zero retained artifacts were listed. Workflow definitions and logs contained no exposed usable credential.
- **Releases/assets:** zero releases or release assets. The repository's asset is an original textual SVG; other game visuals are code/inline data.
- **Issues, PRs and comments at baseline:** zero issues, PRs, issue comments, PR review comments, or commit comments. The new draft PR and its checks are reviewed separately at the checkpoint.
- **Other surfaces:** zero deployments, packages, or discussions. Wiki and GitHub Pages were disabled. No public deployment was created.
- **Sanitized GitHub surface exports:** zero findings after excluding the authenticated-only field described below.

## Authenticated metadata finding — not repository exposure

The initial private local export of `GET /repos/soonieboi/critterdex` included GitHub's authenticated-only `temp_clone_token` field. Gitleaks correctly flagged it as a generic API key. This was a credential field returned by the authenticated API, not a secret in repository files, Git history, Actions logs, or a surface made public by changing repository visibility.

The field was removed from the local evidence export, which now uses an explicit metadata allowlist. It was never displayed, used, committed, pushed, or included in this report. A subsequent scan of the sanitized exports returned zero findings. No credential validation or rotation was attempted. Publication remains paused so the reviewer can assess this finding and the audit scope independently.

## Limitations and review gate

A clean scanner result is not proof that no secret exists. The audit covers the advertised reachable remote refs and accessible repository surfaces at the recorded baseline, plus this PR's reviewed additions. It cannot establish the contents of hidden/unadvertised server objects, provider backups, deleted or inaccessible logs/artifacts, external links, inaccessible forks, or unrelated private stores. No key validity check was made.

Changing a repository to public exposes its reachable history and existing public-facing surfaces, not just the current files. Before publication, independently review the exact draft PR head, final CI/log scan, this scope and the authenticated metadata finding. Any new refs, files, comments, logs, artifacts, or releases require a fresh check. Visibility remains private until that review checkpoint is explicitly completed.
