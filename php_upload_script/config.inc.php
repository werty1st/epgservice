<?php
error_reporting(E_ERROR | E_PARSE);


$senderliste = array ("ZDF"	=> "zdf",
					  "ZDFneo"	=> "zdfneo",
					  "ZDF.kultur"=> "zdf.kultur",
					  "ZDFinfo"	=> "zdfinfo",
					  "3sat"	=> "3sat",
					  "KI.KA"	=> "ki.ka",
					  "arte"	=> "arte");

// $senderliste = array ( "ZDF.kultur"=> "zdf.kultur" );
// $senderliste = array ( "ZDF"=> "zdf" );

define("URL", "http://www.zdf.de/ZDF/zdfportal/api/v2/epg?station=%s&startDate=%s&endDate=%s&currentIndex=%s");


$cache_dir ="cache";
$db_name = "epgservice";
$db_host = "http://localhost:5984";


//curl -X PUT -d "10" http://localhost:5984/epgservice/_revs_limit
//curl -H "Content-Type: application/json" -X POST http://localhost:5984/epgservice/_compact


//XML Object Useragent
$opts = array(
    'http' => array(
        'user_agent' => 'PHP libxml, ZDF TTP (api v2)',
    )
);
$context = stream_context_create($opts);
libxml_set_streams_context($context);

# Additional site configuration settings. Allows to override global settings.
if (file_exists('config.php')) {
	include_once('config.php');
}
