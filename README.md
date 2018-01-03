# The Unsafe Server

![badge](https://img.shields.io/badge/security-trash-red.svg)

This is a crappy blog with a critical vulnerability.

### Setup

These files should go in `/var/www/html`.

Optionally, configure `dnsmasq` to point `static.twlinux.io` to this server.

On Ubuntu:

```bash
sudo apt install git npm telnetd ssh vsftpd
```

### Install Dependencies

```bash
npm install
```

### Run server

```bash
npm start
```
