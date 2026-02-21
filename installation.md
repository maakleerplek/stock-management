# Stock Management Installation Guide

Follow these steps carefully to set up and configure the Stock Management System and InvenTree backend.

## 1. Initial Source Setup

1. **Clone the repository:**

   ```bash
   git clone <repository_url>
   cd stock-management
   ```

2. **Set up your environment variables:**
   Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

## 2. Network Configuration

Open `.env` in your text editor and configure the networking variables:

1. **Find your Local IP Address:**
   - On Windows: `ipconfig` (Look for IPv4 Address)
   - On Mac/Linux: `ifconfig` or `ip a`
2. **Set `SITE_IP`:**

   ```env
   SITE_IP=192.168.1.100  # Replace with your actual IP
   ```

3. **Set `INVENTREE_SITE_URL`:**
   _Critical:_ This must start with `http://` or `https://`!

   ```env
   INVENTREE_SITE_URL="https://192.168.1.100:8443"
   ```

## 3. Start the Containers

Boot the Docker Compose stack in detached mode. This will pull the necessary images and start all services (Frontend, Backend, Proxy, InvenTree Server, DB, Redis, Worker).

```bash
docker compose up -d
```

_Note: The first time you run this, InvenTree will take a few extra minutes to initialize its database and run static file collections._

## 4. InvenTree Setup & API Token Generation

Your Backend (Python/FastAPI) needs permission to talk to the InvenTree server. You must generate an API token and provide it to the backend.

1. **Create an Admin Account:**
   If you didn't uncomment the auto-admin variables in `.env`, create a superuser manually:

   ```bash
   docker compose exec inventree-server invoke createsuperuser
   ```

   Follow the prompts to set a username, email, and password.

2. **Log in to InvenTree:**
   Open a browser and navigate to the `INVENTREE_SITE_URL` you configured (e.g., `https://<YOUR_IP>:8443`). Log in with the superuser account you just created.
   _Note: Because Caddy generates self-signed certificates locally, your browser will show an SSL warning. Click "Advanced" and "Proceed to localhost" or accept the risk._

3. **Generate an API Token:**
   - Click your profile name in the top right corner.
   - Click **Settings** -> **API Tokens** (or navigate to `https://<YOUR_IP>:8443/accounts/api-tokens/`).
   - Create a new token for your user if one does not exist.
   - **Copy the generated API Token**.

## 5. Finalize Configuration

1. **Update `.env` with your Token:**
   Open your `.env` file and set the `INVENTREE_TOKEN` variable:

   ```env
   # InvenTree API token (generate from InvenTree: Settings -> API Tokens)
   INVENTREE_TOKEN=inv-your-generated-token-here
   ```

2. **Restart the Backend Service:**
   The backend needs to be restarted to pick up the new token.

   ```bash
   docker compose restart backend
   ```

## 6. Access the Application

The system should now be fully functional.

- **Stock Management App (Frontend):**
  `https://stock.localhost` (Locally)
  `https://<YOUR_SITE_IP>` (Over the network)
- **Backend API Docs:**
  `http://localhost:8001/docs` (Locally)
- **InvenTree Dashboard:**
  `https://inventree.localhost` (Locally)
  `https://<YOUR_SITE_IP>:8443` (Over the network)

## 7. Connecting to Nginx Proxy Manager (Optional)

If you are exposing your application to the outside world via Nginx Proxy Manager (NPM), follow these general steps:

1. **Proxy Host for Stock Management (Frontend):**
   - **Domain Names:** `stock.your-domain.com`
   - **Scheme:** `http`
   - **Forward Hostname / IP:** Your `SITE_IP` (e.g., `192.168.1.100`)
   - **Forward Port:** `80`
   - Enable **Block Common Exploits** and configure your SSL certificate as usual.

2. **Proxy Host for InvenTree Dashboard:**
   - **Domain Names:** `inventree.your-domain.com`
   - **Scheme:** `https` (Note: Must be `https` since Caddy handles its own SSL)
   - **Forward Hostname / IP:** Your `SITE_IP` (e.g., `192.168.1.100`)
   - **Forward Port:** `8443`
   - Enable **Block Common Exploits** and configure your SSL certificate.

_Note: If you have issues passing through HTTPS to port 8443, you can edit `docker-compose.yml` to expose `inventree-server`'s native port 8000 to HTTP, and proxy that directly._

## Troubleshooting

- **401 Unauthorized:** If your frontend reports "Failed to fetch categories" and the backend logs show a 401 error, your `INVENTREE_TOKEN` in `.env` is missing or invalid. Check the token and run `docker compose restart backend`.
- **Config Error (`visited path does not match SITE_URL`):** Ensure `INVENTREE_SITE_URL` in `.env` is formatted correctly, including `http(s)://` and the correct port.
- **Backend Crash on Startup Check:** Check the logs using `docker compose logs backend`. If it fails to boot, verify your `.env` formatting.
