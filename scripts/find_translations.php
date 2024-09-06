<?php

$folders_frontend = ['./frontend/app', './frontend/lib'];
$folders_api = ['./api/app', './api/routes'];
$fields = [];

$baseLanguage = 'en';

foreach ($folders_frontend as $folder) {
    foreach (
        glob("$folder/{,*/,*/*/,*/*/*/}*.{js,jsx,ts,tsx}", GLOB_BRACE)
        as $file
    ) {
        $content = @file_get_contents($file);
        preg_match_all(
            '/[\W]t\([\s\n]*[\'"`](.+?)[\'"`][\s\n]*\)/',
            $content,
            $matches
        );
        foreach ($matches[1] as $fieldName) {
            $fields[$fieldName] = $fieldName;
        }
    }
}
foreach ($folders_api as $folder) {
    foreach (glob("$folder/{,*/,*/*/,*/*/*/}*.{php}", GLOB_BRACE) as $file) {
        $content = @file_get_contents($file);
        preg_match_all(
            '/[\W]__\([\s\n]*[\'"`](.+?)[\'"`][\s\n]*\)/',
            $content,
            $matches
        );
        foreach ($matches[1] as $fieldName) {
            $fields[$fieldName] = $fieldName;
        }
    }
}

function replaceDots(array $fields): array
{
    $f = [];
    foreach ($fields as $k => $v) {
        $f[str_replace('.', '_', $v)] = $v;
    }
    return $f;
}

$fields = array_unique($fields);
$fields = replaceDots($fields);

$data = [
    $baseLanguage => $fields,
];

echo json_encode($data, JSON_PRETTY_PRINT);
