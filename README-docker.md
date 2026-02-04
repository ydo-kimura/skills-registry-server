# Private Agent Skills Registry Server

This is a lightweight proxy server packaged as a Docker image that allows you to use private/organizational skills with the [skills CLI](https://github.com/vercel-labs/skills), without modifying the CLI source code.

While you can add private skills directly using `npx skills add` by specifying the repository, you have to remember and type the exact repository information correctly. This project eliminates that hassle and enables you to search for private skills using the `find` command.

## Quick Start (Docker)

The easiest way to run the private registry is using Docker.

```bash
# 1. Prepare your skills definition directory locally
mkdir -p my-registry
# Add your yaml files to my-registry/ (see 'Defining Skills' below)

# 2. Run the container
docker run -d -p 3000:3000 \
  -v $(pwd)/my-registry:/app/registry \
  --name skills-server \
  ydokimura/skills-registry-server:latest
```

## Usage

### 1. Defining Skills

Create a local directory (e.g., `registry`) to store your private skill definitions.
Add YAML files for each skill you want to register.

**Example `registry/deploy-skill.yaml`:**

```yaml
name: deploy-skill
description: Example private skill for deployment.
# Source can be any valid git URL or shorthand supported by 'skills' CLI:
# - GitHub shorthand: owner/repo
# - Full URL: https://github.com/owner/repo
# - Deep link: https://github.com/owner/repo/tree/main/skills/my-skill
# - Generic Git: git@github.com:owner/repo.git
source: my-org/deploy-skill
license: MIT
metadata:
  author: my-org
  version: '1.0'
```

### 2. Configure the Skills CLI

Once your server is running, point your `skills` CLI to it using the environment variable:

```bash
export SKILLS_API_URL=http://localhost:3000
```

Now you can search and add your private skills:

```bash
npx skills find deploy-skill
npx skills add deploy-skill
```

## Features

- **Proxy Search**: Seamlessly merges private skills with public results from `skills.sh`.
- **Hot Reloading**: Automatically reloads skills when you modify files in your mounted volume.
- **Lightweight**: Minimal memory footprint.

## License

MIT
