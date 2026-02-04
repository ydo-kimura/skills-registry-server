# Private Agent Skills Registry Server

This is a lightweight proxy server packaged as an npm package that allows you to use private/organizational skills with the [skills CLI](https://github.com/vercel-labs/skills), without modifying the CLI source code.

While you can add private skills directly using `npx skills add` by specifying the repository, you have to remember and type the exact repository information correctly. This project eliminates that hassle and enables you to search for private skills using the `find` command.

## Quick Start (npx)

The easiest way to run the private registry is using `npx`.

```bash
# 1. Prepare your skills definition directory locally
mkdir -p registry
# Add your yaml files to registry/ (see 'Defining Skills' below)

# 2. Run the server
npx @ydokimura/skills-registry-server
```

## Usage

### 1. Defining Skills

Create a local directory (e.g., `registry`) in the same location where you run the server.
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
npx skills search deploy-skill
```

## Features

- **Proxy Search**: Seamlessly merges private skills with public results from `skills.sh`.
- **Hot Reloading**: Automatically reloads skills when you modify files in your local directory.
- **Lightweight**: Minimal memory footprint.

## License

MIT
