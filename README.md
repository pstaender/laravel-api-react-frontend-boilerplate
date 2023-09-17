# Opinionated boilerplate for a laravel-powered-api with a react SPA frontend

## Requirements

    * PHP 8.1+
    * NodeJS 16+

## Tools, Libraries and Frameworks

    * Laravel
    * React (with react-route, recoil, react-i18next and react-i18nify)
    * Parcel (for building and developing JS, includes SCSS support and HMR)

## Setup

    $ yarn install
    $ cd api
    $ composer install
    $ php artisan key:generate

Copy `api/.env.example` to `api/.env`, setup value (name, db etc…), then:

    $ php artisan migrate

Change for your app needs:

    * routes in `api/routes/web.php`
    * e-mail-templates `api/resources/views/emails`
    * change logo(s) `/logo.svg` and `/logo.webp`

## Development

    $ yarn develop

For testing e-mails locally, use mailhog. 
