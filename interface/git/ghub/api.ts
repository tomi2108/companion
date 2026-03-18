import { Octokit } from "octokit";
export const ghub = () => new Octokit();

export function getOwnerRepoById(id: string) {
  const parts = id.split("/");
  if (parts.length !== 2) throw new Error("Id must be of the form 'owner/repo'");

  const owner = parts[0];
  const repo = parts[1];
  if (!owner || !repo) throw new Error(`Project ${id} not found`);
  return { owner, repo };
}

export function getOwnerRepoByUrl(url: string) {
  const match = url.match(/github\.com[/:]([^/]+)\/([^/.]+)(\.git)?/);
  if (!match) throw new Error("Invalid GitHub repo url");

  const owner = match[1];
  const repo = match[2];
  if (!owner || !repo) throw new Error(`Project ${url} not found`);
  return { owner, repo };
}
