import {Command, flags} from '@oclif/command'
import { OutputFlags, Input } from '@oclif/parser';
import { Config, loadConfig } from './lib/config';
import { MissingParamsError } from './lib/errors';

import { getRepos, importRepos, getReposFromFile } from './lib/import';

import moment = require('moment');
import chalk from 'chalk';

class SnykGithubImport extends Command {
  static description = 'describe the command here';

  static examples = [
    '$ snyk-github-import -o <org_token> -i <integration_token> -u https://hostname/api/v3 -g <ghe_token>',
    '$ snyk-github-import -o <org_token> -i <integration_token> -f ./repoList.csv',
  ];

  static defaults = {
    apiBase: 'https://snyk.io/api/v1',
    githubUrl: 'https://api.github.com',
    days: 1,
  };

  static userConfig: Config;

  static flags = {
    // add --version flag to show CLI version
    version: flags.version({
      char: 'v',
    }),
    help: flags.help({
      char: 'h',
    }),
    githubToken: flags.string({
      char: 'g',                    // shorter flag version
      description: 'GitHub Token', // help description for flag
      hidden: false,                // hide from help
      exclusive: ['input'],    // this flag cannot be specified alongside this other flag
    }),
    githubOrg: flags.string({
      char: 'h',                    // shorter flag version
      description: 'a specific org to import from', // help description for flag
      hidden: false,                // hide from help
      exclusive: ['input'],    // this flag cannot be specified alongside this other flag
    }),
    githubUrl: flags.string({
      char: 'u',                    // shorter flag version
      description: `e.g. '${SnykGithubImport.defaults.githubUrl}' or 'http(s)://hostname/api/v3/`,
      hidden: false,                // hide from help
      default: SnykGithubImport.defaults.githubUrl,
      exclusive: ['input'],    // this flag cannot be specified alongside this other flag
    }),
    days: flags.integer({
      char: 'd',
      description: `e.g. ${SnykGithubImport.defaults.days}`, // help description for flag
      default: SnykGithubImport.defaults.days,
      exclusive: ['input'],    // this flag cannot be specified alongside this other flag
    }),
    since: flags.string({
      char: 's',
      description: 'ISO 8601 format date', // help description for flag
      exclusive: ['input'],    // this flag cannot be specified alongside this other flag
    }),
    input: flags.string({
      char: 'f',
      description: 'List of repo to import', // help description for flag
      exclusive: ['githubOrg', 'githubUrl', 'days', 'since'],
    }),
    snykToken: flags.string({
      char: 't',
      description: 'Access token to be leveraged', // help description for flag
    }),
    integrationId: flags.string({
      char: 'i',
      description: 'Snyk integration to be leveraged', // help description for flag
      required: true,
    }),
    orgId: flags.string({
      char: 'o',
      description: 'Snyk org to import into', // help description for flag
      required: true,
    }),
    snykApi: flags.string({
      char: 'a',
      description: `Snyk api (e.g. ${SnykGithubImport.defaults.apiBase}`, // help description for flag
      default: SnykGithubImport.defaults.apiBase,
    }),
  };

  private parsedFlags ?: OutputFlags<typeof SnykGithubImport.flags>;
  static args = [{name: 'file'}]

  async run() {
    SnykGithubImport.userConfig = loadConfig(this);
    const { flags } = this.parse(this.constructor as Input<typeof SnykGithubImport.flags>);
    this.parsedFlags = flags;

    // at least one type of ignore needs to be specified
    if ( !this.parsedFlags.githubToken && !this.parsedFlags.input ){
      throw new MissingParamsError([SnykGithubImport.flags.githubToken.name, SnykGithubImport.flags.input.name]);
    }

    const snykToken = this.parsedFlags.snykToken ?? SnykGithubImport.userConfig.token;

    let repos;

    if (this.parsedFlags.githubToken){
      let since = this.parsedFlags.since;
      if (since) {
        since = moment(since);
      } else {
        since = moment().subtract(this.parsedFlags.days, 'days').startOf('day');
      }
  
      this.log(chalk.grey(`Importing repos modified since ${since.format()}`));
      repos = await getRepos(this.parsedFlags.githubUrl, this.parsedFlags.githubToken, since, this.parsedFlags.githubOrg);
      this.log(chalk.grey(`Found ${repos.length} repo${repos.length > 1 ? 's' : ''} to import`));
    } else {
      repos = getReposFromFile(this.parsedFlags.input);
    }
    

    const results = await importRepos(
      repos,
      this.parsedFlags.snykApi,
      snykToken,
      this.parsedFlags.orgId,
      this.parsedFlags.integrationId);

    results.map((item: any) => {
      this.log('Importing from ' + chalk.green(`${item.target.owner}/${item.target.name}:${item.target.branch}`) + `  @ ${item.location}`);
  });

  }
}



export = SnykGithubImport
