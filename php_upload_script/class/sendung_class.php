<?php

class sendung{

	private $xml;
	private $timestamp = 0;
	private $detailsUrl;
	private $titel;

	function __construct ( $sendetermin, $position ) {

		//neue xml erzeugen
		$xml = new DOMDocument('1.0', 'UTF-8');

		//sendetermin importieren um mit xpath suchen zu können
		$mySendungNode = $xml->importNode($sendetermin, true);
		$xml->appendChild($mySendungNode);

		//add NS for xpath
		$xpath = new DOMXPath($xml);
		$xpath->registerNameSpace('zdf', 'http://www.zdf.de/api/contentservice/v2');


		//Sendername 
		$matches = $xpath->query('/zdf:Sendetermin/zdf:sender/zdf:Sender/zdf:titel/text()');
		$stationName = $matches->item(0)->nodeValue;

		//url um die restlichen daten abzurufen
		$matches = $xpath->query('/zdf:Sendetermin/zdf:epgBeitrag/zdf:Beitrag_Reference/@ref');
		$this->detailsUrl = $matches->item(0)->nodeValue;


		//titel der sendung
		$matches = $xpath->query('/zdf:Sendetermin/zdf:titel/text()');
		$this->titel = $matches->item(0)->nodeValue;


		//sendetermin wieder entfernen da <xml> neu aufgebaut wird
		$xml->removeChild($mySendungNode);
		
		$sendung = $xml->createElement("sendung");
		$xml->appendChild( $sendung );

		// $position = str_pad ( (int)$position, 3, "0", STR_PAD_LEFT ); //führende null wird irgendwo gelöscht, darum nehme ich sie erstmal raus
		$prehash = $stationName."_".$position;
		$hash 	 = md5($prehash);
		$ID 	 = $xml->createElement("_id", $hash);
		$pos 	 = $xml->createElement("position", $position);
		
		$sendung->appendChild( $ID );
		$sendung->appendChild( $pos );


		/*
		$firstChildA = $xml->getElementsByTagName('xml')->item(0);
		$firstChildB = $xml->getElementsByTagName('xml')->item(0)->firstChild;
		//var_dump($firstChild); exit;
		$firstChildA->insertBefore($ID,$firstChildB);
		$firstChildA->insertBefore($pos,$firstChildB);
		*/
		// echo $xml->saveXML(); exit;

		$this->xml = $xml;
	}

	public function getComplete($i){

		//be verbose
	    if (microtime(true) - $this->timestamp > 0.5) {
	    	$this->timestamp = microtime(true);
		    $out = $i."% Lade Details zur Sendung: ".$this->titel;
		    
		    console($out);
		}
		 
		$sendungsDetails = new DOMDocument('1.0', 'UTF-8');	
		$xml  			 = $this->xml;
		$sendung 	     = $xml->getElementsByTagName('sendung')->item(0);

		try {
		        $sendungsDetails->load($this->detailsUrl);

		        $xpath = new DOMXPath($sendungsDetails);
				$xpath->registerNameSpace('zdf', 'http://www.zdf.de/api/contentservice/v2');


				//beschreibung <= text
				$matches = $xpath->query('/zdf:Beitrag/zdf:sendetermin/zdf:Sendetermin/zdf:text/text()');
				$value = $matches->item(0)->nodeValue;
				$element = $xml->createElement("beschreibung", $value);
				$sendung->appendChild( $element );

				//beschreibungHtml <= textHtml
				$matches = $xpath->query('/zdf:Beitrag/zdf:sendetermin/zdf:Sendetermin/zdf:textHtml/text()');
				$value = $matches->item(0)->nodeValue;
				$element = $xml->createElement("beschreibungHtml", $value);
				$sendung->appendChild( $element );
				
				//endeDatum
				$matches = $xpath->query('/zdf:Beitrag/zdf:sendetermin/zdf:Sendetermin/zdf:endeDatum/text()');
				$value = $matches->item(0)->nodeValue;
				$element = $xml->createElement("endTime", $value);
				$sendung->appendChild( $element );
				
				//<images>
				// <image></image>
				$f = $xml->createDocumentFragment();
				$f->appendXML('<images><image>TODO</image></images>');
				$sendung->appendChild($f);


				//link <= <epgBeitrag> <Beitrag_Reference
				$element = $xml->createElement("link", $this->detailsUrl);
				$sendung->appendChild( $element );

				//livestream
				$f = $xml->createDocumentFragment();
				$f->appendXML('<livestream>true</livestream>');
				$sendung->appendChild($f);					

				//station
				$matches = $xpath->query('/zdf:Beitrag/zdf:sendetermin/zdf:Sendetermin/zdf:sender/zdf:Sender/zdf:titel/text()');
				$value = $matches->item(0)->nodeValue;			
				$stationElement = $xml->createElement("station");
				$stationElement->setAttribute("contentId", "0");
				$stationElement->setAttribute("externalId");
				$stationElement->setAttribute("name", $value);
				$stationElement->setAttribute("serviceId", "0");			

				//epgLogo				
				$epgElement = $xml->createElement("epgLogo");
				$epgElement->setAttribute("contentId", "0");
				$epgElement->setAttribute("externalId", "0");

				$element = $xml->createElement("altText");
				$epgElement->appendChild( $element );

				//sender logo url
				$matches = $xpath->query('/zdf:Beitrag/zdf:sendetermin/zdf:Sendetermin/zdf:sender/zdf:Sender/zdf:logo/zdf:Link/zdf:url/text()');
				$value = $matches->item(0)->nodeValue;

				$element = $xml->createElement("uri", $value);
				$epgElement->appendChild( $element );
				$element = $xml->createElement("width", 0);
				$epgElement->appendChild( $element );
				$element = $xml->createElement("height", 0);
				$epgElement->appendChild( $element );

				$stationElement->appendChild( $epgElement );				
				$sendung->appendChild( $stationElement );


				//time
				$matches = $xpath->query('/zdf:Beitrag/zdf:sendetermin/zdf:Sendetermin/zdf:beginnDatum/text()');
				$value = $matches->item(0)->nodeValue;
				$element = $xml->createElement("time", $value);
				$sendung->appendChild( $element );

				//tvTipp
				$f = $xml->createDocumentFragment();
				$f->appendXML('<tvTipp>false</tvTipp>');
				$sendung->appendChild($f);				

				//titel
				$element = $xml->createElement("titel", $this->titel);
				$sendung->appendChild( $element );


				//url <= <meta><Meta><webUrl><Link><url>
				$matches = $xpath->query('/zdf:Beitrag/zdf:meta/zdf:Meta/zdf:webUrl/zdf:Link/zdf:url/text()');
				$value = $matches->item(0)->nodeValue;
				$element = $xml->createElement("url", $value);
				$sendung->appendChild( $element );				

				//programdata
				$f = $xml->createDocumentFragment();
				$f->appendXML('<programdata>TODO</programdata>');
				$sendung->appendChild($f);

		



		        return;

		        if (!($progdata instanceof DOMNode)) throw new Exception("No Document loaded");
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
		echo( $this->xml->saveXML() ); exit;
		return $this->mysendung->getElementsByTagName('sendung')->item(0);		
	}

}
