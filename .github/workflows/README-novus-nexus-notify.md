# When Lovable syncs to this repo, ask NADF Framework to run lovable-to-web + DEV deploy.
#
# Secret on this repo: NADF_DISPATCH_TOKEN (PAT with repo scope on Framework)
name: Notify NADF on Lovable push

on:
  push:
    branches: [main, master]
  workflow_dispatch:

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: repository_dispatch → NovusAIDevelopmentFramework
        env:
          GH_TOKEN: ${{ secrets.NADF_DISPATCH_TOKEN }}
        run: |
          gh api repos/arodriguez-novusintelligence/NovusAIDevelopmentFramework/dispatches \
            -f event_type=lovable-commit \
            -f client_payload[source]=novus-nexus \
            -f client_payload[sha]="${{ github.sha }}" \
            -f client_payload[ref]="${{ github.ref }}"
