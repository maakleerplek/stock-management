# Network Ports

## Local Access

| Service | URL |
|---------|-----|
| Stock Management App | https://stock.localhost |
| InvenTree | https://inventree.localhost |

## Network Access (192.168.68.65)

| Service | URL |
|---------|-----|
| Stock Management App | https://192.168.68.65 |
| InvenTree | https://192.168.68.65:8443 |

## Ports to Forward

| Port | Service |
|------|---------|
| 443 | Stock Management App |
| 8443 | InvenTree |

## Notes

- Self-signed certificates are used - accept the browser warning to proceed
- For network access, add to hosts file on client devices OR accept cert warning in browser
