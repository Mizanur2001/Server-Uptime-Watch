# Server & Website Monitoring

A lightweight monitoring system for servers (CPU, memory, disk) and websites (uptime, latency) with a real-time dashboard using Node.js, MongoDB, React, Socket.IO and cron jobs.

## Table of contents
- Features
- Quick start
- Folder structure
- API / integration
- Health check schema
- Real-time events (Socket.IO)
- Contributing
- License

## Features
- Server monitoring: CPU, memory and disk reported via a remote `/health` endpoint.
- Website monitoring: HTTP ping, latency measurement and favicon fetching.
- Real-time dashboard with live updates via Socket.IO.
- Background polling using `node-cron` (default: every 10 seconds).
- Simple modals to add servers and websites from the frontend.

## Quick start
Requirements: Node.js (16+ recommended), npm, MongoDB (Atlas or local).

### Backend

1. Install dependencies

```powershell
cd Backend; npm install
```

2. Add environment variables (create `Backend/.env`)

```text
PORT=5000
DATABASEURL=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/your-db
JWT_SECRET=replace_with_secret
```

3. Start the backend

```powershell
cd Backend; npm start
```

### Frontend

1. Install dependencies

```powershell
cd Frontend; npm install
```

2. Add environment variables (create `Frontend/.env`)

```text
REACT_APP_API_URL=http://localhost:5000
```

3. Start the frontend

```powershell
cd Frontend; npm start
```

Notes
- The backend initializes Socket.IO and cron jobs on startup.
- Use `npm run dev` if the project includes a development script (check `Backend/package.json`).

## Folder structure (overview)

```
Backend/
  ├─ config/         # express, db, socket, cronBot
  ├─ controllers/    # controllers for servers, websites and monitors
  ├─ models/         # Mongoose models
  ├─ routes/         # API routes
  ├─ app.js
  └─ package.json

Frontend/
  ├─ src/            # React app (components, pages)
  ├─ public/
  └─ package.json

Server/uptime_agent/  # optional agent to run on monitored servers
```

## API (selected endpoints)

- Add server

  - `POST /api/v1/server/add`
  - Body example:

```json
{
  "name": "Intern Server",
  "ip": "159.89.161.8",
  "port": 4000,
  "apiKey": "supersecretkey"
}
```

- Add website

  - `POST /api/v1/website/add`
  - Body example:

```json
{
  "domain": "https://example.com",
  "serverId": "6925da09a71246ca13477545"
}
```

Validation: the frontend requires a protocol (`https://` or `http://`) in the domain and will show a toast if missing.

## Health check schema (server)

The backend expects monitored servers to expose a `/health` endpoint that returns JSON in this format:

```json
{
  "cpu": 12,
  "memUsed": 123456789,
  "memTotal": 456789123,
  "diskUsed": 123456789000,
  "diskTotal": 456789123000
}
```

## Real-time updates (Socket.IO)

- The backend emits `servers_update` and `websites_update` events with the latest data.
- Example (server -> frontend):

```js
io.emit('servers_update', data);
// frontend listens:
socket.on('servers_update', (data) => setServers(mapServerData(data)));
```

## Cron jobs

Monitoring runs on a schedule (default every 10 seconds). Example schedule snippet in `cronBot.js`:

```js
cron.schedule('*/10 * * * * *', async () => {
  const serverData = await checkServers(null, null, true);
  io.emit('servers_update', serverData);
});
```

## Favicon / Logo

Frontend fetches a site's favicon using Google's favicon service:

```
https://www.google.com/s2/favicons?domain=${domain}&sz=64
```

## Tech stack
- Node.js, Express, MongoDB (Mongoose)
- React, TailwindCSS
- Socket.IO, Axios, node-cron

## TODO / Future enhancements
- Email/SMS alerts for downtime
- Persisted uptime history and graphs
- Response-code logging for websites
- User authentication and multi-tenant support

## Contributing
PRs and issues are welcome — open a ticket on GitHub.

## License
MIT