# Stremio IR Provide
A plugin for Stremio to stream movies and series from Iranian providers like 30nama or avamovie. 

Also, you can share one account for multiple users without any trouble :)

## Usage:
After installing the plugin (currently not available for public usage), 
search title and results will be available to watch.

## proxy server:
In countries like Iran, where IMDb and Metahub are sanctioned or censored, thumbnails and covers provided by these sources may be inaccessible. If your addon server is hosted outside these restricted regions, this service can automatically proxy all covers and thumbnails through a Proxy Server.

**Enabling the Proxy Feature:**

1. To enable this feature, set [PROXY_ENABLE](./.env.example#L6) to true.
2. Specify the public URL endpoint of your proxy server by setting [PROXY_URL](./.env.example#L6).

The other default settings are sufficient for basic usage and should work without additional modifications.
## Supported provides:

- [x] [Avamovie](https://avamovie.shop)
- [ ] [30nama](https://30nama.com)
- [ ] [Download day](https://download-day.com/)