<?php

class sendung{

	private $mysendung;
	private $timestamp = 0;

	function __construct ( $sendung ) {

		$mysendung = new DOMDocument();
		//$xml_sendung = $this->sendung->createElement("sendung");
		
		// Import the node, and all its children, to the document
		$mySendungNode = $mysendung->importNode($sendung, true);

		// And then append it to the "<root>" node
		$mysendung->appendChild($mySendungNode);

		//manipulate sendung
		//$sendungsID = $sendung->getElementsByTagName('link')->item(0)->nodeValue;
		//$content = "http://www.zdf.de/ZDF/zdfportal/xml/epg/20196106,014c0432-e900-31b2-9763-cd0a1f6c9cc3";	
		//$preg_one = preg_match("/\,([^\,]*)$/", $sendungsID, $sendungsID);

		$airtime 		= $sendung->getElementsByTagName('time')->item(0)->nodeValue;
		$stationName  	= $sendung->getElementsByTagName('station')->item(0)->getAttribute("name");
		// $stationName 	= $stationName->getAttribute("name");

		$prehash = $stationName."-".$airtime;
		$hash 	 = md5($prehash);
		$ID 	 = $mysendung->createElement("_id", $hash);
		

		//TODO reihenfolge stimmt nicht ID soll zuerst kommen
		$firstChildA = $mysendung->getElementsByTagName('sendung')->item(0);
		$firstChildB = $mysendung->getElementsByTagName('sendung')->item(0)->firstChild;
		//var_dump($firstChild); exit;
		$firstChildA->insertBefore($ID,$firstChildB);

		// echo $mysendung->saveXML(); exit;

		$this->mysendung = $mysendung;
	}

	public function getComplete($i){

		//be communicative
	    if (microtime(true) - $this->timestamp > 0.5) {
	    	$this->timestamp = microtime(true);
		    $out = $i."% Lade Details zur Sendung: ".$this->mysendung->getElementsByTagName('titel')->item(0)->nodeValue;
		    
		    console($out);
		}
		 

		$xml_details = new DOMDocument();
		$url = $this->mysendung->getElementsByTagName('link')->item(0)->nodeValue;
		$xml_details->load($url);

		$progdata = $xml_details->getElementsByTagName('programdata')->item(0);

		// Import the node, and all its children, to the document
		$progdata = $this->mysendung->importNode($progdata, true);

		// And then append it to the "<root>" node
		$this->mysendung->getElementsByTagName('sendung')->item(0)->appendChild($progdata);
	}

	public function getNode() {
		return $this->mysendung->getElementsByTagName('sendung')->item(0);		
	}

}
