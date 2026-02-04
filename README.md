# Private Agent Skills Registry Server

This is a lightweight proxy server that allows you to use private/organizational skills with the [skills CLI](https://github.com/vercel-labs/skills), without modifying the CLI source code.

While you can add private skills directly using `npx skills add` by specifying the repository, you have to remember and type the exact repository information correctly. This project eliminates that hassle and enables you to search for private skills using the `find` command.

## Features

- **Proxy Search**: Seamlessly merges private skills with public results from `skills.sh`.
- **Hot Reloading**: Automatically reloads skills when you modify files in the `registry` directory.
- **No CLI Changes**: Works by simply setting an environment variable (`SKILLS_API_URL`).

## Usage

### 1. Prepare Private Skills Registry

We recommend decoupling the **metadata** (definitions) from the **source code** (scripts).
Creating a `registry` directory and placing individual YAML files for each skill is the best practice for maintainability.

**Directory Structure:**
```
.
└── registry/
    ├── deploy-skill.yaml
    └── audit-skill.yaml
```

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

### 2. Host the Server

Choose your preferred way to run the server.

#### Option A: Run via npm (Recommended)

You can run the server directly using `npx` without installation.

```bash
# Start server on port 3000
npx @ydokimura/skills-registry-server

# Or specify a custom port
PORT=8080 npx @ydokimura/skills-registry-server
```

#### Option B: Run via Docker

The Docker image is hosted at `ydokimura/skills-registry-server`.

```bash
# Pull the image
docker pull ydokimura/skills-registry-server:latest

# Run the container (mounting your registry directory)
docker run -d -p 3000:3000 \
  -v $(pwd)/registry:/app/registry \
  --name skills-server ydokimura/skills-registry-server
```

#### Option C: Run Locally (Development)

1.  Clone this repository and install dependencies:
    ```bash
    pnpm install
    ```
2.  Start the development server:
    ```bash
    pnpm dev
    ```

### 3. Configure the Skills CLI

Point the `skills` CLI to your local server using the `SKILLS_API_URL` environment variable.

```bash
export SKILLS_API_URL=http://localhost:3000
```

Now you can search and add your private skills:

```bash
npx skills find deploy-skill
npx skills add deploy-skill
```

## Limitations

- **Install Counts**: Since the CLI sends telemetry directly to Vercel, this server cannot track installation counts of private skills unless the CLI code is modified.

## License

MIT
