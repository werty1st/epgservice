<?php

class sendung{

	private $xml;
	private $timestamp = 0;
	private $detailsUrl;
	private $titel;
	private $stationName;

	function __construct ( $sendetermin, $position, $stationName ) {

		//neue xml erzeugen
		$xml = new DOMDocument('1.0', 'UTF-8');

		//sendetermin importieren um mit xpath suchen zu können
		$mySendungNode = $xml->importNode($sendetermin, true);
		$xml->appendChild($mySendungNode);

		//add NS for xpath
		$xpath = new DOMXPath($xml);
		$xpath->registerNameSpace('zdf', 'http://www.zdf.de/api/contentservice/v2');


		//Sendername 
		// $matches = $xpath->query('/zdf:Sendetermin/zdf:sender/zdf:Sender/zdf:titel/text()');
		// $stationName = $matches->item(0)->nodeValue;
		$this->stationName = $stationName;

		//url um die restlichen daten abzurufen
		$matches = $xpath->query('/zdf:Sendetermin/zdf:epgBeitrag/zdf:Beitrag_Reference/@ref');
		$this->detailsUrl = $matches->item(0)->nodeValue;


		//titel der sendung
		$matches = $xpath->query('/zdf:Sendetermin/zdf:titel/text()');
		$this->titel = $matches->item(0)->nodeValue;


		$sendung = $xml->createElement("sendung");
		$xml->appendChild( $sendung );
		

		// $position = str_pad ( (int)$position, 3, "0", STR_PAD_LEFT ); //führende null wird irgendwo gelöscht, darum nehme ich sie erstmal raus
		$prehash = $stationName."_".$position;
		$hash 	 = md5($prehash);
		$ID 	 = $xml->createElement("_id", $hash);
		$pos 	 = $xml->createElement("position", $position);
		
		$sendung->appendChild( $ID );
		$sendung->appendChild( $pos );



				//titel
				$element = $xml->createElement("titel");
				$sendung->appendChild( $element );
				$element->appendChild($xml->createTextNode( $this->titel ));

				//untertitel
				$matches = $xpath->query('/zdf:Sendetermin/zdf:untertitel/text()');
				$value = $matches->item(0)->nodeValue;
				$element = $xml->createElement("subtitle");
				$sendung->appendChild( $element );	
				$element->appendChild($xml->createTextNode( $value ));
				
				//dachzeile/kicker
				$matches = $xpath->query('/zdf:Sendetermin/zdf:dachzeile/text()');
				$value = $matches->item(0)->nodeValue;
				$element = $xml->createElement("kicker");
				$sendung->appendChild( $element );	
				$element->appendChild($xml->createTextNode( $value ));


				//beschreibung <= text
				$matches = $xpath->query('/zdf:Sendetermin/zdf:text/text()');
				$value = $matches->item(0)->nodeValue;
				$element = $xml->createElement("beschreibung");
				$sendung->appendChild( $element );		
				$element->appendChild($xml->createTextNode($value));

				//echo $value."\n\n";

				//station
				// $matches = $xpath->query('/zdf:Sendetermin/zdf:sender/zdf:Sender/zdf:titel/text()');
				// $value = $matches->item(0)->nodeValue;			
				$stationElement = $xml->createElement("station");
				$stationElement->setAttribute("contentId", "0");
				$stationElement->setAttribute("externalId");
				$stationElement->setAttribute("name", $this->stationName);
				$stationElement->setAttribute("serviceId", "0");			

				//epgLogo				
				$epgElement = $xml->createElement("epgLogo");
				$epgElement->setAttribute("contentId", "0");
				$epgElement->setAttribute("externalId", "0");

				$element = $xml->createElement("altText");
				$epgElement->appendChild( $element );

				//sender logo url
				$matches = $xpath->query('/zdf:Sendetermin/zdf:sender/zdf:Sender/zdf:logo/zdf:Link/zdf:url/text()');
				$value = $matches->item(0)->nodeValue;

				$element = $xml->createElement("uri", $value);
				$epgElement->appendChild( $element );
				$element = $xml->createElement("width", 0);
				$epgElement->appendChild( $element );
				$element = $xml->createElement("height", 0);
				$epgElement->appendChild( $element );

				$stationElement->appendChild( $epgElement );				
				$sendung->appendChild( $stationElement );


				//endeDatum
				$matches = $xpath->query('/zdf:Sendetermin/zdf:endeDatum/text()');
				$value = $matches->item(0)->nodeValue;
				$element = $xml->createElement("endTime", $value);
				$sendung->appendChild( $element );
				
				//<images> BIS JETZT SIND ZWEI ARTEN BEKANNT
                // /EPG/treffer/Sendetermin/bildfamilie/VisualFamily_Reference
                    $element = $xml->createElement("images");
                    //images holen
                    $matches = $xpath->query('/zdf:Sendetermin/zdf:bildfamilie/zdf:VisualFamily_Reference/@ref');
                    $value = $matches->item(0)->nodeValue;	//url der bilder
                    if ($value != ""){
                        $this->getImages($element,$value);
                    } else {
                        $matches = $xpath->query('/zdf:Sendetermin/zdf:bildfamilie/zdf:AutoVisualFamily/zdf:zuschnitte');
                        //$value = $matches->item(0);
                        $this->getImages2($element,$matches);
                    }

                    //images einfügen
                    $sendung->appendChild($element);
                //ODER
                // /EPG/treffer/Sendetermin/bildfamilie/AutoVisualFamily/zuschnitte

                // /EPG/treffer/Sendetermin/bildfamilie/AutoVisualFamily/zuschnitte/Zuschnitt/image/Link/url
                // http://www.epg-image.zdf.de/fotobase-webdelivery/images/42e211a2-0be9-4a13-817d-7a8e2e3826aa?layout=672x378






				//link <= <epgBeitrag> <Beitrag_Reference
				$element = $xml->createElement("link", $this->detailsUrl);
				$sendung->appendChild( $element );

				//livestream
				$f = $xml->createDocumentFragment();
				$f->appendXML('<livestream>true</livestream>');
				$sendung->appendChild($f);	



				//time
				$matches = $xpath->query('/zdf:Sendetermin/zdf:beginnDatum/text()');
				$value = $matches->item(0)->nodeValue;
				$element = $xml->createElement("time", $value);
				$sendung->appendChild( $element );

			

				//programdata
				$programdata = $xml->createElement("programdata");
					$element 	= $xml->createElement("actorDetails");
					$programdata->appendChild( $element );


					$matches = $xpath->query('/zdf:Sendetermin/zdf:beginnDatum/text()');
					$value = $matches->item(0)->nodeValue;
					$element 	= $xml->createElement("airtimeBegin", $value);
					$programdata->appendChild( $element );


					$matches = $xpath->query('/zdf:Sendetermin/zdf:sendeTag/text()');
					$value = $matches->item(0)->nodeValue;
					$element  	= new DateTime($value);
					$element  	= $xml->createElement("airtimeDate", $element->format('c') );
					$programdata->appendChild( $element );


					$element 	= $xml->createElement("audioComments", "false");
					$programdata->appendChild( $element );

					$element 	= $xml->createElement("blackwhite", "false");
					$programdata->appendChild( $element );

					$stationElement 	= $xml->createElement("broadcastStation");
						$stationElement = $xml->createElement("station");
						$stationElement->setAttribute("contentId", "0");
						$stationElement->setAttribute("externalId");
						$stationElement->setAttribute("name", $this->stationName);
						$stationElement->setAttribute("serviceId", "0");			

						//epgLogo				
						$epgElement = $xml->createElement("epgLogo");
						$epgElement->setAttribute("contentId", "0");
						$epgElement->setAttribute("externalId", "0");

						$element = $xml->createElement("altText");
						$epgElement->appendChild( $element );

						//sender logo url
						$matches = $xpath->query('/zdf:Sendetermin/zdf:sender/zdf:Sender/zdf:logo/zdf:Link/zdf:url/text()');
						$value = $matches->item(0)->nodeValue;

						$element = $xml->createElement("uri", $value);
						$epgElement->appendChild( $element );
						$element = $xml->createElement("width", 0);
						$epgElement->appendChild( $element );
						$element = $xml->createElement("height", 0);
						$epgElement->appendChild( $element );
						$stationElement->appendChild( $epgElement );				

					$programdata->appendChild( $stationElement );

			



					$element 	= $xml->createElement("country", "Deutschland");
					$programdata->appendChild( $element );

					$element 	= $xml->createElement("crewFunctionDetails");
					$programdata->appendChild( $element );

					$element 	= $xml->createElement("dolbyDigital51", "false");
					$programdata->appendChild( $element );
					$element 	= $xml->createElement("dolbySurround", "false");
					$programdata->appendChild( $element );
					$element 	= $xml->createElement("dualchannel", "false");
					$programdata->appendChild( $element );
					$element 	= $xml->createElement("foreignLangWithCaption", "false");
					$programdata->appendChild( $element );
				
					$matches = $xpath->query('/zdf:Sendetermin/zdf:dauer/text()');
					$value = $matches->item(0)->nodeValue;
					$element 	= $xml->createElement("duration", $value);
					$programdata->appendChild( $element );

					$element 	= $xml->createElement("guests");
					$programdata->appendChild( $element );

					$element 	= $xml->createElement("hd", "true");
					$programdata->appendChild( $element );

					$element 	= $xml->createElement("images");
					$programdata->appendChild( $element );

					$element 	= $xml->createElement("livestream", "true");
					$programdata->appendChild( $element );

					$element 	= $xml->createElement("moderators");
					$programdata->appendChild( $element );

					$matches = $xpath->query('/zdf:Sendetermin/zdf:vpsZeit/text()');
					$value = $matches->item(0)->nodeValue;					
					$element 	= $xml->createElement("vpsBegin", $value);
					$programdata->appendChild( $element );

					$element 	= $xml->createElement("widescreen169", "false");
					$programdata->appendChild( $element );

					$element 	= $xml->createElement("url", $this->detailsUrl);
					$programdata->appendChild( $element );
					





				$sendung->appendChild( $programdata );



		//sendetermin wieder entfernen da <xml> neu aufgebaut wird
		$xml->removeChild($mySendungNode);

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




				//beschreibungHtml <= textHtml
				// $matches = $xpath->query('/zdf:Beitrag/zdf:sendetermin/zdf:Sendetermin/zdf:textHtml/text()');
				// $value = $matches->item(0)->nodeValue;
				// $element = $xml->createElement("beschreibungHtml", $value);
				// $sendung->appendChild( $element );
				

					//url <= <meta><Meta><webUrl><Link><url>
					$matches = $xpath->query('/zdf:Beitrag/zdf:meta/zdf:Meta/zdf:webUrl/zdf:Link/zdf:url/text()');
					$value = $matches->item(0)->nodeValue;
					$element = $xml->createElement("url", $value);
					$sendung->appendChild( $element );					

					$programdata = $xml->getElementsByTagName('programdata')->item(0);						

					$element 	= $xml->createElement("caption", "true");
					$programdata->appendChild( $element );

					$category 	= $xml->createElement("category");
					//name )= ZDF_NachrichtenAktuelles
					$matches = $xpath->query('/zdf:Beitrag/zdf:zusatzinformation/zdf:Zusatzinformationen/zdf:elemente/zdf:Sendungsinformation/zdf:kategorien/zdf:Kategorie/zdf:name/text()');
					$value = $matches->item(0)->nodeValue;
					$category->setAttribute("name", $value);
					//id = 111
					$matches = $xpath->query('/zdf:Beitrag/zdf:zusatzinformation/zdf:Zusatzinformationen/zdf:elemente/zdf:Sendungsinformation/zdf:kategorien/zdf:Kategorie/zdf:id/text()');
					$value = $matches->item(0)->nodeValue;
					$element = $xml->createElement("id", $value);

					$category->appendChild( $element );
					$programdata->appendChild( $category );

					$matches = $xpath->query('/zdf:Beitrag/zdf:redaktionellesDatum/text()');
					$value = $matches->item(0)->nodeValue;						
					$element 	= new DateTime($value);
					$element 	= $xml->createElement("year", $element->format('Y'));
					$programdata->appendChild( $element );




				//tvTipp
				$f = $xml->createDocumentFragment();
				$f->appendXML('<tvTipp>false</tvTipp>');
				$sendung->appendChild($f);				








                     
		} catch (Exception $e) {
		        console("sendung_class.php: Sendung konnte nicht geladen werden ".$this->titel);
		        echo "\n";
		}
	}




    private function getImages($element, $url){

        $zuschnitte = new DOMDocument('1.0', 'UTF-8');

        try {
            $zuschnitte->load($url);

            $xpath = new DOMXPath($zuschnitte);
            $xpath->registerNameSpace('zdf', 'http://www.zdf.de/api/contentservice/v2');


            //bild1
            $matches = $xpath->query("/zdf:VisualFamily/zdf:zuschnitte/zdf:Zuschnitt[zdf:breite = '672' and zdf:hoehe = '378']/zdf:image/zdf:Link/zdf:url/text()");
            $imageurl = $matches->item(0)->nodeValue;

            $image 			  = $element->ownerDocument->createElement("image");
            $cuttingDimension = $element->ownerDocument->createElement("cuttingDimension");
            $uri 		      = $element->ownerDocument->createElement("uri", $imageurl);

            $cuttingDimension->setAttribute("contentId", "0");
            $cuttingDimension->setAttribute("externalId", "0");
            $cuttingDimension->setAttribute("height", "378");
            $cuttingDimension->setAttribute("width", "672");
            $cuttingDimension->setAttribute("name", "MMBuehne_Bild_Video_5-5_672x378");

            $image->appendChild( $cuttingDimension );
            $image->appendChild( $uri );
            $element->appendChild( $image );


            //bild2
            $matches = $xpath->query("/zdf:VisualFamily/zdf:zuschnitte/zdf:Zuschnitt[zdf:breite = '90' and zdf:hoehe = '51']/zdf:image/zdf:Link/zdf:url/text()");
            $imageurl = $matches->item(0)->nodeValue;

            $image 			  = $element->ownerDocument->createElement("image");
            $cuttingDimension = $element->ownerDocument->createElement("cuttingDimension");
            $uri 		      = $element->ownerDocument->createElement("uri", $imageurl);

            $cuttingDimension->setAttribute("contentId", "0");
            $cuttingDimension->setAttribute("externalId", "0");
            $cuttingDimension->setAttribute("height", "51");
            $cuttingDimension->setAttribute("width", "90");
            $cuttingDimension->setAttribute("name", "MMBuehne_Bild_Video_5-5_90x51");

            $image->appendChild( $cuttingDimension );
            $image->appendChild( $uri );
            $element->appendChild( $image );



        } catch (Exception $e){
            throw new Exception("Error Processing Images", 1);
        }



    }


    private function getImages2($element, $zuschnitte /*DomNodelist*/){

        if ( $zuschnitte->length > 0){
            $node = $zuschnitte->item(0);
            $xml = $node->ownerDocument;
        } else { return; }

        $xpath = new DOMXPath($xml);
        $xpath->registerNameSpace('zdf', 'http://www.zdf.de/api/contentservice/v2');

        // /EPG/treffer/Sendetermin/bildfamilie/AutoVisualFamily/zuschnitte/Zuschnitt/image/Link/url
            // http://www.epg-image.zdf.de/fotobase-webdelivery/images/42e211a2-0be9-4a13-817d-7a8e2e3826aa?layout=672x378

        try {

            $matches = $xpath->query("//zdf:Zuschnitt/zdf:image/zdf:Link/zdf:url", $node);

            foreach ($matches as $n) {
                $imgurl = $n->nodeValue;

                //bild1
                if (strpos($imgurl, "layout=672x378") !== false){
					$image 			  = $element->ownerDocument->createElement("image");
					$cuttingDimension = $element->ownerDocument->createElement("cuttingDimension");
					$uri 		      = $element->ownerDocument->createElement("uri", $imgurl);

					$cuttingDimension->setAttribute("contentId", "0");
					$cuttingDimension->setAttribute("externalId", "0");
					$cuttingDimension->setAttribute("height", "378");
					$cuttingDimension->setAttribute("width", "672");
					$cuttingDimension->setAttribute("name", "MMBuehne_Bild_Video_5-5_672x378");
					
					$image->appendChild( $cuttingDimension );
					$image->appendChild( $uri );
					$element->appendChild( $image );                	
                } else if (strpos($imgurl, "layout=90x51") !== false){
					$image 			  = $element->ownerDocument->createElement("image");
					$cuttingDimension = $element->ownerDocument->createElement("cuttingDimension");
					$uri 		      = $element->ownerDocument->createElement("uri", $imgurl);

					$cuttingDimension->setAttribute("contentId", "0");
					$cuttingDimension->setAttribute("externalId", "0");
					$cuttingDimension->setAttribute("height", "51");
					$cuttingDimension->setAttribute("width", "90");
					$cuttingDimension->setAttribute("name", "MMBuehne_Bild_Video_5-5_90x51");
					
					$image->appendChild( $cuttingDimension );
					$image->appendChild( $uri );
					$element->appendChild( $image );
                }
            }


		} catch (Exception $e){
			throw new Exception("Error Processing Images", 1);
		}



	}

	public function getNode() {
		return $this->xml->getElementsByTagName('sendung')->item(0);
	}

}
