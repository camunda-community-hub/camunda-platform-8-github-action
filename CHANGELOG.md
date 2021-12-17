# Changelog

## 1.0.0

Use zeebe-node 2.4.0. This makes the minimum Node requirements: 12.22.5+, 14.17.5+, or 16.6.1+.

## 0.6.0

Add parameter `githubToken` to `startWorkers` operation. If this is set as `githubToken: ${{ secrets.GITHUB_TOKEN }}`, then your worker code will have a hydrated [Octokit](https://github.com/actions/toolkit/tree/master/packages/github) reference in scope as `octokit`.
