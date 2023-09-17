# Opinionated boilerplate for a laravel-powered-api with a react SPA frontend

[![status](https://github.com/pstaender/laravel-api-react-frontend-boilerplate/actions/workflows/specs.yml/badge.svg)](https://github.com/pstaender/laravel-api-react-frontend-boilerplate/actions)

## Requirements

  * PHP 8.1+
  * NodeJS 18+

## Features (tools, libraries and frameworks)

  * Laravel v10
  * React (with react-route, recoil, react-i18next and react-i18nify)
  * Parcel v2 (for building and developing JS, includes SCSS support and HMR)
  * jest for JS tests
  * github actions for ci (running php and js tests)

## Folder Structure

  * `/api`: Laravel application
  * `/frontend`: SPA js application
  * `/scripts`: script for building js app

## Setup

```sh
$ yarn install
$ cd api
$ composer install
$ php artisan key:generate
```

Copy `api/.env.example` to `api/.env`, setup value (name, db etc…). Then run to get laravel working:

```sh
$ php artisan migrate
```

Change for your app needs:

  * routes in `api/routes/web.php`
  * e-mail-templates `api/resources/views/emails`
  * change logo(s) `/logo.svg` and `/logo.webp`
  * Replace `yourserver.local` in the project with your production domain

## Development

```sh
$ yarn develop
```

## JavaScript production build

```sh
$ yarn build
```

It will generate all production-ready static files in the `/dist`-folder.

## Others

For testing e-mails in development, I recommend mailhog.

TypeScript is not enabled by default (because I'm not using it). But parcel itself supports TS, so enabling should be easy.

## CORS Settings

To make requests from external domains to the api possible, the following CORS-settings in laravel where added:

  * `api/config/cors.php`: added `'sanctum/token'` to `paths`
  * `api/app/Http/Middleware/VerifyCsrfToken.php`: added `*` wildcard
## License

MIT License

## Disclaimer

This repo is (just) a boilerplate for creating projects with a laravel-driven api and a JS SPA as frontend.

Please check carefully all security related settings (CORS, database, mail etc) before deploying on production.

Please also ensure that you always run on the latest possible PHP (`composer update`) and NodeJS (`yarn update`) modules :) 


