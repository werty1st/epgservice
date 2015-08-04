<?php
libxml_use_internal_errors(true);

class sender{

	protected $myxml;
	private $sendungen;


	function __construct ($mysender, $date_start, $date_end) {

		$url = sprintf(URL, $mysender, $date_start, $date_end);

		$xml_in = new DOMDocument();
		$xml_in->load($url."/".$mysender."?".$action);
		
		if (strpos($http_response_header[0], '503')) {
			throw new Exception('P12 antwortet mit 503 Fehler.');
		}		

		$myxml 				= new DOMDocument('1.0', 'UTF-8');
		$xml_objectResponse = $myxml->createElement("objectResponse");
		$f 					= $myxml->createDocumentFragment();
		$f->appendXML(' <status><statuscode>ok</statuscode></status>');
		$xml_objectResponse->appendChild($f);
		
		if ($xml_in->getElementsByTagName("treffer")->length == 0){
			throw new Exception('XML Fehler.');
		}
		
		$miniEPG 	 				= $xml_in->getElementsByTagName("treffer")->item(0);
		$xml_miniEPG 				= $myxml->createElement("tinyEPG"); //ausgabe xml

			// if($miniEPG->hasAttribute("contentId")){
			// 	$xml_miniEPG->setAttribute("miniEPGcontentId", $miniEPG->getAttribute("contentId"));
			// }

		//erstelle knoten sendungen um alle sendungen eines tages an zu hängen
		$xml_sendungen = $myxml->createElement("sendungen");
		$xml_miniEPG->appendChild( $xml_sendungen );

		$xml_objectResponse->appendChild( $xml_miniEPG );
		$myxml->appendChild( $xml_objectResponse );


		$this->myxml 	 = $myxml;
		$this->sendungen = $xml_sendungen;

		//sendungen durchparsen
		$sendungen = $xml_in->getElementsByTagName('Sendetermin');


		echo $this->toString(true);

		exit;
		//sendung verarbeiten
		// $imax = $sendungen->length;
		// $i1 = 1;
		// $pos = 1;
		// foreach ($sendungen as $sendung) {
		// 	$fortschritt = ($i1++)*100/$imax; $fortschritt = number_format($fortschritt, 2);
		//     $mysendung = new sendung($sendung,$pos++);		    
		//     $mysendung->getComplete($fortschritt);
		//     $this->appendSendung($mysendung);
		// }		
	}



	public function toString($human = false) {

		if( $human){
		  	//Format XML to save indented tree rather than one line
			$this->myxml->preserveWhiteSpace = false;
			$this->myxml->formatOutput = true;		   
		}

		return $this->myxml->saveXML();
	}

	private function appendSendung($sendung) {
		
		$mySendungNode = $this->myxml->importNode($sendung->getNode(), true);
		$this->sendungen->appendChild( $mySendungNode );
	}

	public function getSendungen(){

		return $this->myxml->getElementsByTagName('sendung');
	}

	public function getSendungXML($sendung){

		// $xmlstring = "";
		// foreach ($sendung->childNodes as $node) {
		// 	$xmlstring .= $this->myxml->saveXML($node);
		// }

		// return $xmlstring;

		return $this->myxml->saveXML($sendung);
	}
}

class sender_fromfile extends sender{

	protected $myxml;

	function __construct ($filename) {
		$this->myxml = new DOMDocument();
		$this->myxml->load($filename);
	}	
}
