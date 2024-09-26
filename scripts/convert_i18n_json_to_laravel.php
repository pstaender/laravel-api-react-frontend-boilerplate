<?php

$data = json_decode(file_get_contents(array_pop($argv)), true);

if (empty($data)) {
    echo "No data found in the JSON file. Check filepath/format.\n";
    exit(1);
}

function replaceMustacheWithLaravel(string $string)
{
    return preg_replace_callback(
        '/(%)[\{]*(.+?)([\W])/',
        function ($matches) {
            if ($matches[3] === '}') {
                $matches[3] = '';
            }
            return ":$matches[2]$matches[3]";
        },
        $string
    );
}

$data = $data[array_key_first($data)];
foreach ($data as $k => $v) {
    // preg_replace('/(\$)[\{]*(.+?)([\W])/', ":$2$3", 'Der Code ist gültig für ${Minuten} Minuten')
    $data[replaceMustacheWithLaravel($k)] = replaceMustacheWithLaravel($v);
}
echo json_encode($data, JSON_PRETTY_PRINT);
