#!/usr/bin/php
<?php

//Settings
include_once("config.inc.php");
include_once("class/sender_class.php");
include_once("class/sendung_class.php");
include_once("class/couch_class.php");


//db_setup
$couch = &Factory::getDB(array("host" => $db_host,
							   "name" => $db_name));


//set Date
//if time >= 00:00 and < 5:30 

if ( ( time() >= strtotime("00:00:00") ) && ( time() < strtotime("05:30:00")) ) {
    //Sendetag = heute-1
    $date_start = date('Y-m-d', strtotime('-1 day', time() ));
    $date_end   = date('Y-m-d');

} else {
    //Sendetag = heute
    $date_start = date('Y-m-d');
    $date_end   = date('Y-m-d', strtotime('+1 day', time() ));
}


//main loop
foreach ($senderliste as $station => $value) {
	
	try {
		//all
		console("Lade Programmdaten von: ".$station);
		echo "\n";

		//einzelne sendungen durchlaufen    
		$xml_allday = new Sender($senderliste[$station], $date_start, $date_end);
        $xml_allday->collectSendungen();

		file_put_contents($cache_dir."/".$station.".xml",$xml_allday->toString());
		/*
		*/
		/// ODER
		/*
		$xml_allday = new sender_fromfile($cache_dir."/".$station.".xml");
		*/


		$couch->store2db($xml_allday,$station);
		echo "\n";
	} catch (Exception $e) {
		//echo "\tXML fuer Sender $station kann nicht abgerufen werden: ".$e->getMessage()."\n";
		file_put_contents( 'php://stderr', "\tXML fuer Sender $station kann nicht abgerufen werden: ".$e->getMessage()."\n" );
	}
}

//db_cleanup
console("cleanup run.");echo "\n";
$couch->cleanup(false); //true=all



exit;

//todo erstmal übersicht laden und in db speichern
//als nä
//übersicht durchlaufen und neues doc erzeugen und speichern

//ausgabe mit couchdb list funktion map reduce

//update git commit -am "update `date`"

//load xml

//create sender

//for each sendung append sendung to new sender

//return sender

//set header

//cache url + timestamp (in minuten) 

//timeline aufbauen oder durchreichen für "ohne getall"?



function console($msg){
    
    $col = exec('tput cols 2> /dev/null');
    if (!is_numeric($col)) return;

    $spaces = $col - strlen($msg);

    if ($spaces <= 0) {
        $msg = substr($msg,0,$col);
        $spaces = 0;
    }
    echo "\r".$msg.str_repeat(" ", $spaces);flush();    
}



function xmlToArray($xml, $options = array()) {
    $defaults = array(
        'namespaceSeparator' => ':',//you may want this to be something other than a colon
        'attributePrefix' => '',   //to distinguish between attributes and nodes with the same name
        'alwaysArray' => array(),   //array of xml tag names which should always become arrays
        'autoArray' => true,        //only create arrays for tags which appear more than once
        'textContent' => '$',       //key used for the text content of elements
        'autoText' => true,         //skip textContent key if node has no attributes or child nodes
        'keySearch' => false,       //optional search and replace on tag and attribute names
        'keyReplace' => false       //replace values for above search values (as passed to str_replace())
    );
    $options = array_merge($defaults, $options);
    $namespaces = $xml->getDocNamespaces();
    $namespaces[''] = null; //add base (empty) namespace
 
    //get attributes from all namespaces
    $attributesArray = array();
    foreach ($namespaces as $prefix => $namespace) {
        foreach ($xml->attributes($namespace) as $attributeName => $attribute) {
            //replace characters in attribute name
            if ($options['keySearch']) $attributeName =
                    str_replace($options['keySearch'], $options['keyReplace'], $attributeName);
            $attributeKey = $options['attributePrefix']
                    . ($prefix ? $prefix . $options['namespaceSeparator'] : '')
                    . $attributeName;
            $attributesArray[$attributeKey] = (string)$attribute;
        }
    }
 
    //get child nodes from all namespaces
    $tagsArray = array();
    foreach ($namespaces as $prefix => $namespace) {
        foreach ($xml->children($namespace) as $childXml) {
            //recurse into child nodes
            $childArray = xmlToArray($childXml, $options);
            list($childTagName, $childProperties) = each($childArray);
 
            //replace characters in tag name
            if ($options['keySearch']) $childTagName =
                    str_replace($options['keySearch'], $options['keyReplace'], $childTagName);
            //add namespace prefix, if any
            if ($prefix) $childTagName = $prefix . $options['namespaceSeparator'] . $childTagName;
 
            if (!isset($tagsArray[$childTagName])) {
                //only entry with this key
                //test if tags of this type should always be arrays, no matter the element count
                $tagsArray[$childTagName] =
                        in_array($childTagName, $options['alwaysArray']) || !$options['autoArray']
                        ? array($childProperties) : $childProperties;
            } elseif (
                is_array($tagsArray[$childTagName]) && array_keys($tagsArray[$childTagName])
                === range(0, count($tagsArray[$childTagName]) - 1)
            ) {
                //key already exists and is integer indexed array
                $tagsArray[$childTagName][] = $childProperties;
            } else {
                //key exists so convert to integer indexed array with previous value in position 0
                $tagsArray[$childTagName] = array($tagsArray[$childTagName], $childProperties);
            }
        }
    }
 
    //get text content of node
    $textContentArray = array();
    $plainText = trim((string)$xml);
    if ($plainText !== '') $textContentArray[$options['textContent']] = $plainText;
 
    //stick it all together
    $propertiesArray = !$options['autoText'] || $attributesArray || $tagsArray || ($plainText === '')
            ? array_merge($attributesArray, $tagsArray, $textContentArray) : $plainText;
 
    //return node as array
    return array(
        $xml->getName() => $propertiesArray
    );
}

