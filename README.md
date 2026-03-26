# codetrace-action

GitHub Action for AI-powered changelog generation using [CodeTrace](https://codetrace.eu).

## Usage

```yaml
- uses: f0d010c/codetrace-action@v1
  with:
    api-key: ${{ secrets.CODETRACE_API_KEY }}
    repository-id: ${{ vars.CODETRACE_REPOSITORY_ID }}
    from-ref: v1.0.0
    to-ref: v1.1.0
```

## Inputs

| Input | Required | Default | Description |
|---|---|---|---|
| `api-key` | yes | — | Your CodeTrace API key (store as a secret) |
| `repository-id` | yes | — | CodeTrace repository UUID (from Developer Settings) |
| `from-ref` | yes | — | Start tag, branch, or commit SHA |
| `to-ref` | no | `HEAD` | End tag, branch, or commit SHA |
| `output-format` | no | `markdown` | `markdown`, `plaintext`, `html`, or `json` |
| `output-file` | no | — | Write changelog to this file path |
| `api-url` | no | `https://codetrace.eu` | CodeTrace API base URL |

## Outputs

| Output | Description |
|---|---|
| `changelog` | The generated changelog text |
| `prompt-tokens` | Number of prompt tokens used |
| `completion-tokens` | Number of completion tokens used |

## Example: Auto-update release notes on publish

```yaml
name: Generate Changelog

on:
  release:
    types: [created]

jobs:
  changelog:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Generate changelog
        id: changelog
        uses: f0d010c/codetrace-action@v1
        with:
          api-key: ${{ secrets.CODETRACE_API_KEY }}
          repository-id: ${{ vars.CODETRACE_REPOSITORY_ID }}
          from-ref: ${{ github.event.release.target_commitish }}
          to-ref: ${{ github.sha }}
          output-format: markdown
          output-file: CHANGELOG.md

      - name: Update release notes
        uses: actions/github-script@v7
        with:
          script: |
            await github.rest.repos.updateRelease({
              owner: context.repo.owner,
              repo: context.repo.repo,
              release_id: context.payload.release.id,
              body: `${{ steps.changelog.outputs.changelog }}`
            });
```

## Setup

1. Go to [codetrace.eu](https://codetrace.eu) → **Developer Settings**
2. Create an API key and add it as `CODETRACE_API_KEY` in your repo secrets
3. Copy your repository ID and add it as `CODETRACE_REPOSITORY_ID` in your repo variables
