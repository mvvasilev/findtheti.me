
![](project-image.png)
A convenient scheduling assistant written in Rust and React, found at https://findtheti.me

## Setup

The simplest way to set this application up is via docker. Its images can be found at https://hub.docker.com/r/mvv97/findthetime. 
Also, it is only compatible with PostgreSQL at the moment. It is required to have a PostgreSQL database already setup and running.

### Simple (With Docker)

#### Without SSL

```sh
docker run 
    -e DATABASE_URL='postgresql://{postgres user}:{postgres password}@{postgres host}/{postgres database}' 
    -p {port to run on}:8080
    mvv97/findthetime:latest
```

#### With SSL
```sh
docker run 
    -e DATABASE_URL='postgresql://{postgres user}:{postgres password}@{postgres host}/{postgres database}' 
    -e SSL_ENABLED='true'
    -v /data/findtheti-me/certs:/etc/findtheti-me/certs # Place your cert files in /data/findtheti-me/certs and ensure they have permissions of at least 644
    -p {http port to run on}:8080 # if SSL_REDIRECT=false, this can be skipped
    -p {ssl port to run on}:8443
    mvv97/findthetime:latest
```

### Example docker-compose.yml
```yml
version: "3.4"

services:

  postgresql:
    image: "docker.io/library/postgres:16-alpine"
    restart: unless-stopped
    volumes: 
      - '/data/findtheti-me/postgres_data:/var/lib/postgresql/data'
    environment:
      POSTGRES_PASSWORD: ${PG_PASS:?database password required}
      POSTGRES_USER: ${PG_USER:-findthetime}
      POSTGRES_DB: ${PG_DB:-findthetime}

  findthetime:
    image: "docker.io/mvv97/findthetime:latest"
    restart: unless-stopped
    environment:
      DATABASE_URL: "postgres://${PG_USER:-findthetime}:${PG_PASS}@postgresql/${PG_DB:-findthetime}"
      SSL_ENABLED: 'true' # when this is set to false ( default ), the ssl port is not listened to.
      SSL_REDIRECT: 'true'
      SSL_PORT: '8443'
      SSL_CERT_PATH: '/etc/findtheti-me/certs/server.cert'
      SSL_KEY_PATH: '/etc/findtheti-me/certs/server.key'
    volumes:
      - '/data/findtheti-me/certs:/etc/findtheti-me/certs' 
    ports:
      - '8080:8080'
      - '8443:8443'
```

Ensure you have the necessary environment variables configured: `PG_DB`, `PG_USER` and `PG_PASS`.

### Advanced (Without Docker)

1. Compile Backend (`cargo build --release`)
2. Build Frontend (`cd frontend && yarn install && yarn build`)
3. Copy the `findtheti-me` file from `target/release` and place it into your desired installation folder
4. Copy the `frontend/dist` folder and place it into the same installation folder, maintaining the directory tree.

In the end, your folder structure should be as follows:
```
installationDir/
|-frontend/
| |-dist/
|-findtheti-me
```
5. Next, create a `.env` file in the root of the installation directory, and look at `.env.example` for what should be in there

Finally, run `./findtheti-me` in the root, and the application should start.

### Enable SSL

In order to enable SSL, configure `SSL_ENABLED=true`, `SSL_PORT` with the desired port ( `8443` by default ), and `SSL_CERT_PATH` and `SSL_KEY_PATH`
with the paths to your certificate and key files ( `/etc/letsencrypt/live/your.domain/cert.pem` and `/etc/letsencrypt/live/your.domain/key.pem`, for example ).
Ensure the permissions of these files are at least `644`, as the container user will need to be able to read them.

**Note that there is currently no support for encrypted private keys ( those that start with `-----BEGIN ENCRYPTED PRIVATE KEY-----`).
Attempting to use such will be met with the error:**

```
Unable to use files configured in 'SSL_CERT_PATH' or 'SSL_KEY_PATH': Custom { kind: Other, error: "private key format not supported" }
```
`findtheti.me` will automatically register a listener at the configured `HTTP_PORT` to redirect
to the configured `SSL_PORT`. To disable this, configure `SSL_REDIRECT=false` ( `true` by default ).

## Setup For Development
### Backend
1. Create a PostgreSQL database
2. Configure a `.env` in the project root directory ( following `.env.example` )
3. Run `cargo sqlx migrate run` to run all migrations ( ensure you've created the database beforehand )
4. `cargo run` to run the backend ( or `cargo build` to compile it, with the `--release` flag for an optimized build )

### Frontend
1. `yarn install`
2. If using SSL on the backend, change the proxy in `vite.config.ts` to reflect that.
3. `yarn dev` ( or `yarn build`/`yarn preview` )

### Docker Build Image
1. Do Backend and Frontend setups first
2. Run `cargo sqlx prepare` ( ensure .sqlx directory has been created. The one included in this git repo may be out of date. )
3. `docker build .` ( or `podman build .` ) in root directory