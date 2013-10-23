<?php

class sender{

	protected $myxml;
	private $sendungen;


	function __construct ($mysender) {

		global $url,$action;

		$xml_in = new DOMDocument();
		$xml_in->load($url."/".$mysender."?".$action);
		

		$this->myxml = new DOMDocument('1.0', 'UTF-8');
		$xml_objectResponse 			= $this->myxml->createElement("objectResponse");

			$miniEPG 	 				= $xml_in->getElementsByTagName("miniEPG")->item(0);
			$xml_miniEPG 				= $this->myxml->createElement("tinyEPG");
			$xml_miniEPG->setAttribute("miniEPGcontentId", $miniEPG->getAttribute("contentId"));

				$xml_sendungen		 	= $this->myxml->createElement("sendungen");
				$this->sendungen = $xml_sendungen;

				$xml_miniEPG->appendChild( $xml_sendungen );
			
			$xml_objectResponse->appendChild( $xml_miniEPG );

		$this->myxml->appendChild( $xml_objectResponse );


		//sendungen durchparsen
		$sendungen = $xml_in->getElementsByTagName('sendung');

		//sendung verarbeiten
		$imax = $sendungen->length;
		$i1 = 1;
		foreach ($sendungen as $sendung) {
			$fortschritt = ($i1++)*100/$imax; $fortschritt = number_format($fortschritt, 2);
		    $mysendung = new sendung($sendung);		    
		    $mysendung->getComplete($fortschritt);
		    $this->appendSendung($mysendung);
		}		
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