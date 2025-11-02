# Opinionated boilerplate for laravel-powered-api with react SPA frontend 🚀

[![status](https://github.com/pstaender/laravel-api-react-frontend-boilerplate/actions/workflows/specs.yml/badge.svg)](https://github.com/pstaender/laravel-api-react-frontend-boilerplate/actions)

https://github.com/pstaender/laravel-api-react-frontend-boilerplate/assets/140571/283aa657-92c3-493b-bcf3-c85a3723b837

## Requirements

  * PHP 8.3+
  * NodeJS 22+

## Features (tools, libraries, frameworks and concepts)

  * Laravel v12
  * React (using react-route, recoil, react-i18next and react-i18nify)
  * VitejS (bundling js/jsx/ts) with HMR for development
  * jest for JS tests
  * github actions for php and js tests
  * unified translations for react-frontend and laravel
  * optional: passwordless login otps via e-mail
  * optional: 2fa via laravel fortify

## Folder Structure

  * `/api`: Laravel application
  * `/frontend`: SPA js application
  * `/scripts`: script for building js app

## Setup

Copy `api/.env.example` to `api/.env` and change values according to your setup (name, db etc…).

Ensure that you have access to a database and set the credentials in the `.env`-file.

Then:

```sh
$ npm install
$ cd api
$ composer install
$ php artisan key:generate
$ php artisan migrate
$ cd .. # back to project root
$ npm run i18n:setup
```

Then start webserver and frontend server:

```sh
$ npm run dev
```

Change for your needs:

  * routes in `api/routes/web.php`, `api/routes/api.php` and `api/bootstrap/app.php`
  * e-mail-templates `api/resources/views/emails`
  * change logo(s) `/frontend/assets/logo.svg` and `/frontend/assets/logo.webp`
  * Set your frontend domain url `FRONTEND_URL` in the laravel `.env`-files

### Optional: Queue and Cache via database

```sh
$ php artisan cache:table
$ php artisan queue:table
```

## Development

```sh
$ npm run dev
```

## JavaScript production build

```sh
$ npm run build
```

It generates bundled production-ready frontend static files in the `/dist`-folder.

## Translations

By default, a translation via deepl is supported. Just set a `DEEPL_API_KEY` in the top `.env`-file or a as environment variable. The free deepl api key is sufficient here. All api requests are cached, so only changed values are translated.

Translate with:

```sh
$ npm run i18n
```

You can define custom values to be used for deepl translation in `/i18/yaml/$lang.yml`. You can also define custom translations in `/i18/yaml/custom_translations.yml` which will be applied to the end of the process and will be used as final value (helpful if deepl generates inaccurate translations).

Use the i18nify placeholder is frontend `Hello, %{name}!` and the laravel-placeholder `Hello, :name!` in the api.

## Two-Factor-Authentication

There are two 2fa possible:

  * send a OTP via e-mail (the password is not needed in this case)
  * use user password and 2fa OTP via authenticator app (recommended)

Please do not enable both at the same time, the login process is not designed for this. If you want to use both, you have to adjust the login process.

To disable OTP 2fa (it's enabled by default) remove `TwoFactorAuthenticatable` from `User`-model.

## Mailer

For testing e-mails in development [mailpit](https://mailpit.axllent.org/) is recommended, set in your `/api/.env`-file:

```sh
MAIL_MAILER=smtp
MAIL_HOST=localhost
MAIL_PORT=1025
```

TypeScript is not enabled by default, but vite supports it.

## CORS Settings

To make requests from external domains to the api possible, the following CORS-settings in laravel where added:

  * `api/config/cors.php`: added `'sanctum/token'` to `paths`


## Laravel Routes

Please check the api `api/routes/api.php` and web routes `api/routes/web.php` (used for e-mail landing-pages) to keep only routes you really need.

## License

MIT License

## Disclaimer

This repo is an opinionated boilerplate for creating projects with a laravel-driven api and a JS SPA as frontend.

Please check carefully all security related settings (CORS, database, mail etc) before deploying on production.

Please ensure that you always run on the latest possible php and js modules 🤓

# TODOs

* REMOVE i18n-react
* api docs
* set expire date of tokens
