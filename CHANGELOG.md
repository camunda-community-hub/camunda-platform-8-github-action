# Changelog

## 0.6.0

Add parameter `githubToken` to `startWorkers` operation. If this is set as `githubToken: ${{ secrets.GITHUB_TOKEN }}`, then your worker code will have a hydrated [Octokit](https://github.com/actions/toolkit/tree/master/packages/github) reference in scope as `octokit`.
