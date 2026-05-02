import type { GitHubProfile, GitHubRepository } from "@/types";

type GitHubUserResponse = {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  public_repos: number;
  html_url: string;
};

export async function fetchGitHubProfile(username: string): Promise<GitHubProfile> {
  const cleanUsername = username.trim();
  if (!cleanUsername) {
    throw new Error("GitHub username is required.");
  }

  const [userResponse, reposResponse] = await Promise.all([
    fetch(`https://api.github.com/users/${encodeURIComponent(cleanUsername)}`),
    fetch(
      `https://api.github.com/users/${encodeURIComponent(
        cleanUsername,
      )}/repos?sort=updated&per_page=8`,
    ),
  ]);

  if (!userResponse.ok) {
    throw new Error("We could not find that GitHub profile.");
  }

  if (!reposResponse.ok) {
    throw new Error("GitHub profile loaded, but repositories could not be fetched.");
  }

  const user = (await userResponse.json()) as GitHubUserResponse;
  const repos = (await reposResponse.json()) as GitHubRepository[];

  return {
    login: user.login,
    name: user.name,
    avatarUrl: user.avatar_url,
    bio: user.bio,
    publicRepos: user.public_repos,
    profileUrl: user.html_url,
    topRepositories: repos
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 5),
  };
}
