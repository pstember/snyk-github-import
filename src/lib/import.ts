import { Octokit } from '@octokit/rest';
import request = require('request-promise-native');
import * as csvParse from 'csv-parse';
import fs = require('fs');
import path = require('path');

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

      console.log(target)

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

  export function getReposFromFile(filePath: string){

    let repos: any[] = [];

    const myParser:csvParse.Parser = csvParse({delimiter: ',', trim: true, from_line: 2});

    fs.createReadStream(filePath)
    .pipe(myParser)
    .on('data', (data) => {
      // console.log(data)
      repos.push(
        {
          owner: {
            login: data[1],
          },
          name: String(data[0]).split('/')[1],
          default_branch: 'master',
        });
    })
    .on('end', () => {
      console.log(repos);
      // [
      //   { NAME: 'Daffy Duck', AGE: '24' },
      //   { NAME: 'Bugs Bunny', AGE: '22' }
      // ]
    });



    return repos;

  }