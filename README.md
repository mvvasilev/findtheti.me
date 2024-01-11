# Setup For Development
## Backend
1. Create a PostgreSQL database
2. Configure a `.env` in the project root directory ( following `.env.example` )
3. Run `cargo sqlx migrate run` to run all migrations ( ensure you've created the database beforehand )
4. `cargo run`

## Frontend
1. `yarn install`
2. `yarn dev` ( or `yarn build`/`yarn preview` )

## Docker Build Image
1. Do Backend and Frontend setups first
2. Run `cargo sqlx prepare` ( ensure .sqlx directory has been created. The one included in this git repo may be out of date. )
3. `docker build .` ( or `podman build .` ) in root directory