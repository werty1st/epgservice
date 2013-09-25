<?php
error_reporting(E_ERROR | E_PARSE);


$senderliste = array ("zdf"	=> "29381224",
					  "zdfneo"	=> "29381364",
					  "zdfkultur"=> "29381288",
					  "zdfinfo"	=> "29381362");

$url = "http://www.zdf.de/ZDF/zdfportal/xml/object/";
$action = "action=getAllItems";

$cache_dir ="cache";
$db_name = "epgservice";
$db_host = "http://localhost:5984";
//$db_host = "http://admin:s00fa1@wmaiz-v-sofa01.dbc.zdf.de:80";


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