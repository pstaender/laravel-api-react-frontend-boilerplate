# Opinionated boilerplate for laravel-powered-api with react SPA frontend

[![status](https://github.com/pstaender/laravel-api-react-frontend-boilerplate/actions/workflows/specs.yml/badge.svg)](https://github.com/pstaender/laravel-api-react-frontend-boilerplate/actions)

https://github.com/pstaender/laravel-api-react-frontend-boilerplate/assets/140571/283aa657-92c3-493b-bcf3-c85a3723b837

## Requirements

  * PHP 8.1+
  * NodeJS 20+

## Features (tools, libraries, frameworks and concepts)

  * Laravel v10
  * React (using react-route, recoil, react-i18next and react-i18nify)
  * Parcel v2 (bundling js, scss etc) with HMR for development
  * jest for JS tests
  * github actions for php and js tests
  * unified translations for react-frontend and laravel
  * optional: passwordless login otps via e-mail

## Folder Structure

  * `/api`: Laravel application
  * `/frontend`: SPA js application
  * `/scripts`: script for building js app

## Setup

Copy `api/.env.example` to `api/.env`, change values for your setup (name, db etc…), then:

```sh
$ yarn install
$ cd api
$ composer install
$ php artisan key:generate
$ php artisan migrate
```

Change for your needs:

  * routes in `api/routes/web.php`
  * e-mail-templates `api/resources/views/emails`
  * change logo(s) `/logo.svg` and `/logo.webp`
  * Set your frontend domain url `FRONTEND_URL` in the laravel `.env`-files

### Optional: Queue and Cache via database

```sh
$ php artisan cache:table
$ php artisan queue:table
```

## Development

```sh
$ yarn develop
```

## JavaScript production build

```sh
$ yarn build
```

It generates bundled production-ready frontend static files in the `/dist`-folder.

## Others

For testing e-mails in development mailhog is recommended.

TypeScript is not enabled by default (because I'm not using it). But parcel itself supports TS, so enabling should be easy.

## CORS Settings

To make requests from external domains to the api possible, the following CORS-settings in laravel where added:

  * `api/config/cors.php`: added `'sanctum/token'` to `paths`
  * `api/app/Http/Middleware/VerifyCsrfToken.php`: added `*` wildcard

## Laravel Routes

Please check the api `api/routes/api.php` and web routes `api/routes/web.php` (used for e-mail landing-pages) to keep only routes you really need.

## License

MIT License

## Disclaimer

This repo is (just) a boilerplate for creating projects with a laravel-driven api and a JS SPA as frontend.

Please check carefully all security related settings (CORS, database, mail etc) before deploying on production.

Please also ensure that you always run on the latest possible PHP `composer update` and NodeJS `yarn update` modules :) 


* REMOVE i18n-react
* api docs
* set expire date of tokens

