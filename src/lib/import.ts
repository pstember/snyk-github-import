import { Octokit } from '@octokit/rest';
import request = require('request-promise-native');

export async function getRepos(githubUrl, githubToken, since, githubOrg) {
    const github = new Octokit({
      baseUrl: githubUrl,
      auth: githubToken,
    });

    const listRepos = githubOrg ? github.repos.listForOrg : github.repos.listForAuthenticatedUser;

    let repos:any[] = [];
    for await (const response of github.paginate.iterator(
        listRepos,
        {
            org: githubOrg,
            per_page: 100, // eslint-disable-line
            sort: 'updated',
          },
    )) {
        repos = repos.concat(response.data);
        if (since.isAfter(repos[repos.length-1].updated_at)){
            break; // when too old repo are found
        }
    }

    repos = repos.filter(repo => since.isBefore(repo.updated_at));
    return repos;
  }

  export async function importRepos(repos, apiBase, apiKey, orgId, integrationId) {
    const results = await Promise.all(repos.map(async repo => {
      const target = {
        owner: repo.owner.login,
        name: repo.name,
        branch: repo.default_branch,
      };

      const { headers } = await request({
        method: 'post',
        url: `${apiBase}/org/${orgId}/integrations/${integrationId}/import`,
        headers: {
          authorization: `token ${apiKey}`,
        },
        json: true,
        resolveWithFullResponse: true,
        body: { target },
      });

      return {
        target,
        location: headers.location,
      };
    }));

    return results;
  }