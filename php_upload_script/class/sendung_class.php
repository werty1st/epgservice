<?php

class sendung{

	private $mysendung;
	private $timestamp = 0;

	function __construct ( $sendung, $position ) {

		$mysendung = new DOMDocument();

		// Import the node, and all its children, to the document
		$mySendungNode = $mysendung->importNode($sendung, true);

		// And then append it to the "<root>" node
		$mysendung->appendChild($mySendungNode);


		//add NS for xpath
		$xpath = new DOMXPath($mysendung);
		$xpath->registerNameSpace('zdf', 'http://www.zdf.de/api/contentservice/v2');
		$matches = $xpath->query('/zdf:Sendetermin/zdf:sender/zdf:Sender/zdf:titel/text()');

		$stationName = $matches->item(0)->nodeValue;

		// $position = str_pad ( (int)$position, 3, "0", STR_PAD_LEFT ); //führende null wird irgendwo gelöscht, darum nehme ich sie erstmal raus
		$prehash = $stationName."_".$position;
		$hash 	 = md5($prehash);
		$ID 	 = $mysendung->createElement("_id", $hash);
		$pos 	 = $mysendung->createElement("position", $position);
		


		/*
		$firstChildA = $mysendung->getElementsByTagName('sendung')->item(0);
		$firstChildB = $mysendung->getElementsByTagName('sendung')->item(0)->firstChild;
		//var_dump($firstChild); exit;
		$firstChildA->insertBefore($ID,$firstChildB);
		$firstChildA->insertBefore($pos,$firstChildB);
		*/
		// echo $mysendung->saveXML(); exit;

		$this->mysendung = $mysendung;
	}

	public function getComplete($i){

		//be verbose
	    if (microtime(true) - $this->timestamp > 0.5) {
	    	$this->timestamp = microtime(true);
		    $out = $i."% Lade Details zur Sendung: ".$this->mysendung->getElementsByTagName('titel')->item(0)->nodeValue;
		    
		    console($out);
		}
		 

		 exit;

		//



		$xml_details = new DOMDocument();
		$url = $this->mysendung->getElementsByTagName('link')->item(0)->nodeValue;

		try {
		        $xml_details->load($url);

		        $progdata = $xml_details->getElementsByTagName('programdata')->item(0);

		        if (!($progdata instanceof DOMNode)) throw new Exception("No Document loaded");;
		        // Import the node, and all its children, to the document
		        $progdata = $this->mysendung->importNode($progdata, true);

		        // And then append it to the "<root>" node
		        $this->mysendung->getElementsByTagName('sendung')->item(0)->appendChild($progdata);                        
		} catch (Exception $e) {
		        console("sendung_class.php: URL invalid ".$this->mysendung->getElementsByTagName('titel')->item(0)->nodeValue);
		        echo "\n";        
		        //todo fill with dummy data
		}
	}

	public function getNode() {
		return $this->mysendung->getElementsByTagName('sendung')->item(0);		
	}

}
