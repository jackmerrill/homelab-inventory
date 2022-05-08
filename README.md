# HomeLab Inventory System

_A Supabase-powered inventory system for your Homelab._

Easily keep track of your Homelab's various assets.

This system is designed to be easily scalable and extensible, so you can add as much or as little information about your equipment as you want.

## Features

- Add and remove equipment such as servers, routers, switches, and more
- Add and remove other miscellaneous items such as cables, power strips, and more
- Print QR codes for each item to easily check-in or check-out assets (scanner not included).

## Getting Started

```bash
git clone https://github.com/jackmerrill/homelab-inventory.git
cd homelab-inventory
npm install
npm run build
npm run start
```

Or using Docker:

```bash
docker run -p 3000:3000 -v /usr/bin/lp:/usr/bin/lp -e SUPABASE_URL=.... -e SUPABASE_SECRET_KEY=.... -e PRINTER_NAME=.... ghcr.io/jackmerrill/homelab-inventory
```

## Security

As this project was made quickly, and to be hosted in a private environment, it is not secured for public access.

Supabase's `service_role` key is used to grant access to the database, as implementing RLS (row-level security) was not a priority.

## Contributing

- Fork the project on GitHub
- Create a new branch
- Make your changes
- Commit your changes
- Push your changes to the remote repository
- Submit a pull request

## Contributors

- [@jackmerrill](https://github.com/jackmerrill)
- [@iplusplus42](https://github.com/iplusplus42)
