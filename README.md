# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

---

## Docker

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) >= 20.10
- [Docker Compose](https://docs.docker.com/compose/install/) >= 2.0

### Building the Docker Image Locally

```bash
docker build -t calendar-msi .
```

To pass environment variables at build time (needed for Firebase/Google API configuration):

```bash
docker build \
  --build-arg VITE_FIREBASE_API_KEY=your_key \
  --build-arg VITE_FIREBASE_AUTH_DOMAIN=your_domain \
  --build-arg VITE_FIREBASE_PROJECT_ID=your_project_id \
  --build-arg VITE_FIREBASE_STORAGE_BUCKET=your_bucket \
  --build-arg VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id \
  --build-arg VITE_FIREBASE_APP_ID=your_app_id \
  -t calendar-msi .
```

### Running the Container

```bash
docker run -p 3000:80 calendar-msi
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Running with Docker Compose

```bash
docker-compose up --build
```

The application will be available at [http://localhost:3000](http://localhost:3000).

To run in detached mode:

```bash
docker-compose up --build -d
```

To stop the container:

```bash
docker-compose down
```

### Environment Variables

The Dockerfile accepts the following build-time arguments (`ARG`) for configuring the Vite application. These are passed using `--build-arg` during `docker build` or via the `args` section in `docker-compose.yml`.

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_FIREBASE_API_KEY` | Optional* | Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Optional* | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Optional* | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Optional* | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Optional* | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Optional* | Firebase app ID |
| `VITE_FIREBASE_MEASUREMENT_ID` | Optional | Firebase measurement ID |
| `VITE_GOOGLE_CLIENT_ID` | Optional* | Google OAuth client ID |
| `VITE_GOOGLE_API_KEY` | Optional* | Google API key |
| `VITE_GOOGLE_SHEETS_API_KEY` | Optional | Google Sheets API key |
| `VITE_GOOGLE_SHEETS_SPREADSHEET_ID` | Optional | Google Sheets spreadsheet ID |

> *These variables are technically optional for the Docker build to succeed, but the application will not function correctly without valid Firebase and Google API configuration.

---

## CI/CD Pipeline

The project uses a GitHub Actions workflow (`.github/workflows/docker-ci.yml`) to automate testing, building, and publishing the Docker image.

### Triggers

- **Push to `main`**: Runs the full pipeline (test → build → push to registry)
- **Pull request to `main`**: Runs tests and builds the image (without pushing to the registry)

### Pipeline Stages

1. **Test** — Checks out the code, sets up Node.js 20, installs dependencies with `npm install --legacy-peer-deps`, and runs the test suite with `npm test`. If tests fail, the workflow is marked as failed.

2. **Build and Push** — Depends on the test job succeeding. Checks out the code, sets up Docker Buildx, logs into GitHub Container Registry (GHCR), builds the Docker image, and (on push to main only) pushes the image to GHCR with two tags:
   - `ghcr.io/<owner>/calendar-msi:<short-sha>` (first 7 characters of the commit SHA)
   - `ghcr.io/<owner>/calendar-msi:latest`

### Registry

Images are published to the [GitHub Container Registry (GHCR)](https://ghcr.io). On pull requests, the image is built to verify the Dockerfile is valid but is not pushed to the registry.

---

## Multi-Stage Build Architecture

The Dockerfile uses a multi-stage build to produce an optimized production image:

### Stage 1: Build Stage (`node:20-alpine`)

- Sets up the Node.js environment
- Installs project dependencies with `npm install --legacy-peer-deps`
- Runs `vite build` to compile the React application into static assets in the `dist/` directory

### Stage 2: Serve Stage (`nginx:1.27-alpine`)

- Copies only the compiled static assets from the Build Stage
- Uses a custom nginx configuration with SPA routing support (all non-file requests fall back to `index.html`)
- Runs as a non-root user (`nginx`) for security
- Serves the application on port 80

### Benefits

- **Smaller final image**: The production image contains only nginx and the compiled static files. Node.js, npm, and all build dependencies are discarded, resulting in an image that is significantly smaller than a single-stage build.
- **No source code in production**: The final image does not contain any application source code, `node_modules`, or build tooling — only the compiled output.
- **Better layer caching**: By copying `package.json` and `package-lock.json` before the source code, Docker can cache the dependency installation layer and only re-run it when dependencies change.
- **Improved security**: Running as a non-root user and excluding build tools reduces the attack surface of the production container.
