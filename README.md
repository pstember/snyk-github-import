snyk-github-import
==================

Imports projects from Github repos since a given date or from a CSV file.

> Note: This module is a proof of concept for how you can use the Snyk import API. We hope to roll the findings from this module into the Snyk website eventually, so consider this a work in progress.

## Prerequisites

To use this tool you must first set your API token as you would do for the [https://github.com/snyk/snyk](Snyk CLI)

# Usage

```
USAGE
  $ snyk-github-import [FILE]

OPTIONS
  -a, --snykApi=snykApi              [default: https://snyk.io/api/v1] Snyk api (e.g. https://snyk.io/api/v1
  -d, --days=days                    [default: 1] e.g. 1
  -f, --input=input                  List of repo to import in a SCV format
  -g, --githubToken=githubToken      GitHub Token
  -h, --githubOrg=githubOrg          a specific org to import from
  -h, --help                         show CLI help
  -i, --integrationId=integrationId  (required) Snyk integration to be leveraged
  -o, --orgId=orgId                  (required) Snyk org to import into
  -s, --since=since                  ISO 8601 format date
  -t, --snykToken=snykToken          Access token to be leveraged
  -u, --githubUrl=githubUrl          [default: https://api.github.com] e.g. 'https://api.github.com' or 'http(s)://hostname/api/v3/
  -v, --version                      show CLI version

EXAMPLES
  $ snyk-github-import -o <org_token> -i <integration_token> -u https://hostname/api/v3 -g <ghe_token>
  $ snyk-github-import -o <org_token> -i <integration_token> -f ./repoList.csv
```

## Recommendations

We recommend setting up a cron job to run this script daily at most.

- You can retrieve your `orgId` from your org settings page on [Snyk](https://snyk.io) or via the [Snyk API](https://snyk.docs.apiary.io/#reference/organisations/the-snyk-organisation-for-a-request/list-all-the-organisations-a-user-belongs-to).
- The `integrationId` is available via the integration settings page.
- You can generate a token for access to the GitHub API from your [Personal access tokens](https://github.com/settings/tokens) page.
- The Github URL is only required for Github Server instances and is the base URL that your GitHub Server is available at.

## How this works

When you run `snyk-github-import`, it retrieves all repos that were modified since the date you specify (defaults to 1 day). It then calls the Snyk import API with those repos, which will attempt to import projects from the given repos. If any new target files are found in these repos, this will result in a new project being created.

Please note that this will trigger a retest of any projects that were already imported.
