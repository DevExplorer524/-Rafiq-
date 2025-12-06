# Deployment Guide for Rafiq (رفيق)

This guide provides instructions for deploying the Rafiq application using two popular methods: **Vercel** (recommended for quick frontend deployment) and **Google Cloud Run** (recommended for containerized scalability).

---

## Option 1: GitHub via Vercel (Recommended)

Vercel is the easiest way to deploy React applications directly from your GitHub repository.

### Prerequisites
- A [GitHub](https://github.com) account.
- A [Vercel](https://vercel.com) account.

### Steps

1. **Push Code to GitHub**
   - Initialize a git repository in your project folder if you haven't already:
     ```bash
     git init
     git add .
     git commit -m "Initial commit"
     ```
   - Create a new repository on GitHub and push your code to it.

2. **Import Project to Vercel**
   - Go to your Vercel Dashboard and click **"Add New..."** -> **"Project"**.
   - Select your GitHub repository and click **Import**.

3. **Configure Project**
   - **Framework Preset:** Vercel should automatically detect **Vite**. If not, select it manually.
   - **Root Directory:** Leave as `./`.

4. **Environment Variables**
   - Expand the **Environment Variables** section.
   - You **MUST** add your Gemini API Key here for the build to work correctly.
     - **Key:** `API_KEY`
     - **Value:** `your_actual_google_gemini_api_key_here`

5. **Deploy**
   - Click **Deploy**.
   - Vercel will build your project, inject the API key, and provide you with a live URL (e.g., `https://rafiq-app.vercel.app`).

---

## Option 2: Google Cloud Run

Cloud Run allows you to run stateless containers. We have included a `Dockerfile` and `nginx.conf` in the project root to facilitate this.

### Prerequisites
- [Google Cloud Platform](https://console.cloud.google.com) account.
- [gcloud CLI](https://cloud.google.com/sdk/docs/install) installed and initialized.
- [Docker](https://docs.docker.com/get-docker/) installed.

### Configuration Files
Ensure the following files are present in your project root (they have been added to the project):
- `Dockerfile`: Instructions to build the Node.js app and serve it with Nginx.
- `nginx.conf`: Server configuration to handle React routing.

### Steps

1. **Enable APIs**
   Enable the **Artifact Registry API** and **Cloud Run API** in your Google Cloud Console.

2. **Authenticate**
   ```bash
   gcloud auth login
   gcloud auth configure-docker
   ```

3. **Build the Docker Image**
   Since this is a client-side application, the API Key needs to be "baked" into the build.
   
   Replace `[PROJECT_ID]` with your actual GCP Project ID.

   ```bash
   docker build \
     --build-arg API_KEY=your_actual_google_gemini_api_key_here \
     -t gcr.io/[PROJECT_ID]/rafiq-app .
   ```

   > **Note:** For higher security in production, consider fetching the API key at runtime or using a backend proxy, as baking it into the image makes it visible in the browser network tab (same as Vercel).

4. **Test Locally (Optional)**
   ```bash
   docker run -p 8080:8080 gcr.io/[PROJECT_ID]/rafiq-app
   ```
   Visit `http://localhost:8080` to verify it works.

5. **Push to Container Registry**
   ```bash
   docker push gcr.io/[PROJECT_ID]/rafiq-app
   ```

6. **Deploy to Cloud Run**
   ```bash
   gcloud run deploy rafiq-service \
     --image gcr.io/[PROJECT_ID]/rafiq-app \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --port 8080
   ```

7. **Done!**
   Google Cloud will provide a URL (e.g., `https://rafiq-service-xyz-uc.a.run.app`) where your app is live.
