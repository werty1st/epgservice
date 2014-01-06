<?php
error_reporting(E_ERROR | E_PARSE);


$senderliste = array ("ZDF"	=> "29381224",
					  "ZDFneo"	=> "29381364",
					  "ZDF.kultur"=> "29381288",
					  "ZDFinfo"	=> "29381362");

$url = "http://www.zdf.de/ZDF/zdfportal/xml/object/";
$action = "action=getAllItems";

$cache_dir ="cache";
$db_name = "epgservice";
$db_host = "http://localhost:5984";


//curl -X PUT -d "10" http://localhost:5984/epgservice/_revs_limit
//curl -H "Content-Type: application/json" -X POST http://localhost:5984/epgservice/_compact


//XML Object Useragent
$opts = array(
    'http' => array(
        'user_agent' => 'PHP libxml, ZDF Webmaster (dev)',
    )
);
$context = stream_context_create($opts);
libxml_set_streams_context($context);

# Additional site configuration settings. Allows to override global settings.
if (file_exists('config.php')) {
	include_once('config.php');
}