# Opinionated boilerplate for a laravel-powered-api with a react SPA frontend

## Requirements

  * PHP 8.1+
  * NodeJS 16+
## Tools, Libraries and Fra
meworks

  * Laravel v10
  * React (with react-route, recoil, react-i18next and react-i18nify)
  * Parcel v2 (for building and developing JS, includes SCSS support and HMR)
  * using jest for JS tests

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

## JS Production build

```sh
$ yarn build
```

For testing e-mails locally, I recommend to use mailhog. 
