<?php



class Factory {
    static function &getDB ($construct_params = array())
    {
        static $instance;
        if( ! is_object($instance) )
        {
			require_once 'settee/settee.php';
            $instance = new mycouch($construct_params);   // constructor will be called
        }
        return $instance;
    }
}


class mycouch {

    private $counter = 0;
    private $db;

    function __construct($construct_params) {

	    $defaults = array(
	        'host' => 'http://localhost:5984/',
	        'name' => 'epgservice'	        
	    );
	    $options = array_merge($defaults, $construct_params);

		try {
			// set a new connector to the CouchDB server

			$server = new SetteeServer($options["host"]);

			try {
				$this->db = $server->get_db($options["name"]);				
				console("Database ".$options["name"]." connected.");
				echo "\n";
			} catch (Exception $e) {
				try {
					$server->create_db($options["name"]);
					$this->db = $server->get_db($options["name"]);				
					console("Database ".$options["name"]." connected.");
					echo "\n";				  
				} catch (Exception $e) {
					print_r($e); exit;
				}				
			}

		} catch (Exception $e) {
			print_r($e); exit;
		}

    }
    //function __destruct() {}


	private function updateCounter($doc) {

        $docid = "lastmodified";
        $last_mod_do = "";

        // echo "docid: $docid\n";
        try {
            $last_mod_doc = $this->db->get($docid,true);
            // echo "Update $docid";

        } catch ( Exception $e ) {
            // echo "Doc nicht vorhanden";
            $last_mod_doc = (Array)null;
            $last_mod_doc["_id"] = $docid;
        }       


        //$last_mod_doc->type          = "lastmodified";        
        $last_mod_doc["stations"][$doc["station"]["name"]]["timestamp"] = date_format(new DateTime("now", new DateTimeZone ( "Europe/Berlin" )), DateTime::ATOM);
        //$timestampDoc->{"_rev"} = $doc["_rev"];

        // var_dump($last_mod_doc);
        // exit;

        //todo settee kann kein update wechsel to php on couch oder http://www.saggingcouch.com/

        try {
        	$response = $this->db->save($last_mod_doc);        	
        } catch (Exception $e) {
			//error Doc not saved
			console("\tDocument could not be saved: ".$doc["titel"]);
			console("\tError:".$e);
			echo "\n\n";
        }
        // var_dump($last_mod_doc );
        // var_dump($doc["station"]["name"]); sleep(5);
	}

    private function store1doc($station, $pos, $doc, $fortschritt) {


    	// print_r($doc); exit;

		$docid = $doc["_id"];

		//speichere aktuelle zeit für lastModified
        $now   = date_format(new DateTime("now", new DateTimeZone ( "Europe/Berlin" )), DateTime::ATOM);

		// echo "docid: $docid\n";
        //bilder besorgen
        if ($doc["images"]["image"][0]["cuttingDimension"]["height"] == 378){
        	$bildgroß  = $doc["images"]["image"][0]["uri"];
        	$bildklein = $doc["images"]["image"][1]["uri"];

        	// $bildgroßStr  = file_get_contents($bildgroß);
        	$bildkleinStr = file_get_contents($bildklein);
        	// $doc["images"]["image"][0]["data"] = base64_encode($bildgroßStr);
        	if (strlen($bildkleinStr) >0)
        		$doc["images"]["image"][1]["data"] = "data:image/jpg;base64,".base64_encode($bildkleinStr);
        } else {
			$bildgroß  = $doc["images"]["image"][1]["uri"];
        	$bildklein = $doc["images"]["image"][0]["uri"];

        	// $bildgroßStr  = file_get_contents($bildgroß);
        	$bildkleinStr = file_get_contents($bildklein);
        	// $doc["images"]["image"][0]["data"] = base64_encode($bildgroßStr);
        	if (strlen($bildkleinStr) >0)
        		$doc["images"]["image"][0]["data"] = "data:image/jpg;base64,".base64_encode($bildkleinStr);	        	        	

        }

        //($doc, $name, $file, $mime_type = null)
        // echo "\nXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX\n";
       	// print_r($doc);
        // echo "\nXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXx\n";

        if (strlen($bildkleinStr) >0)
        	$this->db->add_attachment($doc, "small", $bildkleinStr);
        // $doc = $this->db->add_attachment($doc, "large", $bildgroßStr);

        // $doc = $this->db->add_attachment_file($doc, "small", $bildklein);
		if (strlen($bildgroß) >0)
        	$this->db->add_attachment_file($doc, "large", $bildgroß);				

     //    echo "\nXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX\n";
    	// print_r($doc);
     //    echo "\nXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXx\n";


		//hole altes doc nicht mehr by ID sondern by Pos
		//da sind ID aus position ableitet muss der aufwand nicht betrieben werden und ist stabiler

		//$view = $this->db->get_view("epgservice", "listByPosition_view", array("[\"$station\",$pos]","[\"$station\",$pos]")); //startkey=&endkey=["ZDF",50]
		$view = $this->db->get($docid ,true);

		if (count($view->rows)==1)
		{
			// $idbyPos = $view->rows[0]->id;
		 //    $olddoc = $this->db->get($idbyPos ,true);


            $olddocrev = $olddoc["_rev"];

            //zeiten speichern und dann aus DB object löschen um sie mit xml erzeugtem verlgeichen zu können
            $old_item_created  = $olddoc["item_created"];
            $old_item_modified = $olddoc["item_modified"];

            unset($olddoc["item_created"]);
		    unset($olddoc["item_modified"]);

		    //echo "Document $docid already exists!\n";
	
			//no error Doc schon vorhanden
			if ($this->updateORskip($olddoc, $doc)){
				//update
				$doc["_rev"] = $olddoc["_rev"];		
				$doc["_id"] = $olddoc["_id"];		
				
				echo "\n";
                console("Updateing doc: ".$doc["_id"]." with revision: ".$doc["_rev"]);
                echo "\n";

                $doc["item_created"] = $old_item_created;
                $doc["item_modified"] = $now;

				$this->updateCounter($doc);
			} else {    
				echo "\n";            
                console("\tDocument $docid needs no update!");
				return;
			}				
		}	    

		//$this->machMirPlatz($doc);
       

        if (!array_key_exists("item_created", $doc)){
            //echo"\n\tDocument ".$doc["_id"]." is new\t";
            $doc["item_created"]  = $now;
            $doc["item_modified"] = $now;

        }

    	// $diff1 = print_r($olddoc,true);
    	// $diff2 = print_r($doc,true);
    	// file_put_contents("olddoc", $diff1);
    	// file_put_contents("newdoc", $diff2);
    	// // exit;

        //speichern wandelt doc in object -> updatecounter erwartet aber array
        try {
        	$doc2 = $response = $this->db->save($doc);          // couchConflictException        	
        } catch (Exception $e) {
        	console("\tDocument could not be saved: ".$doc["titel"]);
			console("\tError:".$e);
			return;
        }

     //    echo "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX\n";
     //    echo "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXx\n";
    	// print_r($doc);
    	// print_r($doc2);
    	// exit;

        $this->updateCounter($doc);
	

	    if (microtime(true) - $this->counter > 0.2) {
	    	$this->counter = microtime(true);
	   		$out = $fortschritt."% verarbeite Document: ". $doc["titel"];
	 		console($out);				
		}
    }

  //   private function machMirPlatz($doc) {

  //   	//Startkey
  //   	// $startkey = '["'.$doc["station"]["name"].'","'.$doc["time"].'"]';
  //   	// $endkey   = '["'.$doc["station"]["name"].'","'.$doc["endTime"].'"]';

  //   	// $startkey = urlencode($startkey);
  //   	// $endkey = urlencode($endkey);
		
		// //startkey=["ZDF","2013-10-22T12:00:00+02:00"]&endkey=["ZDF","2013-10-22T15:00:01+02:00"]
  //   	//$url = "startkey="

  //       $platzGeschaffen = false;
  //       $na = $doc["time"];
  //       $ne = $doc["endTime"];



  //   	$view = $this->db->get_view("epgservice", "getRangeStartEndTime", $doc["station"]["name"]);

  //   	foreach ($view->rows as $row) {
  //           $id = $row->id;
  //           $startzeit = $aa = $row->value[0];
  //           $endzeit   = $ae = $row->value[1];
  //           $rev     = $row->value[2];
  //   		$titel     = $row->value[3];

  //           if(( $ne > $aa && $ne < $ae) ||
  //             ( $na > $aa && $na < $ae) ||
  //             ( $na < $aa && $ne > $ae)) {                
  //               //Überschneidung löschen

  //               //neues doc
  //               echo "\n";
  //               echo "doc sendung: ". $doc["titel"]."\n";
  //               echo "doc start: ". $doc["time"]."\n";
  //               echo "doc ende : ". $doc["endTime"]."\n\n";

  //               //altes doc
  //               $this->db->delete("{ \"_id\": \"$id\", \"_rev\": \"$rev\" }");
  //               $platzGeschaffen = true;
  //               echo "Lösche veraltetes Programm:\n";
  //               echo "db sendung: $titel\n";
  //               echo "db start: $startzeit\n";
  //               echo "db ende : $endzeit\n\n";
  //             }            
  //       }

  //       return $platzGeschaffen;
  //   }

    private function updateORskip($olddoc,$newdoc){

    	unset ($olddoc["_attachments"]["small"]["content_type"]);
    	unset ($olddoc["_attachments"]["small"]["revpos"]);
    	unset ($olddoc["_attachments"]["small"]["data"]);
    	unset ($olddoc["_attachments"]["small"]["stub"]);
    	unset ($olddoc["_attachments"]["small"]["length"]);

    	unset ($olddoc["_attachments"]["large"]["content_type"]);
    	unset ($olddoc["_attachments"]["large"]["revpos"]);
    	unset ($olddoc["_attachments"]["large"]["data"]);
    	unset ($olddoc["_attachments"]["large"]["stub"]);
    	unset ($olddoc["_attachments"]["large"]["length"]);

    	unset ($newdoc["_attachments"]["small"]["content_type"]);
    	unset ($newdoc["_attachments"]["small"]["data"]);
    	unset ($newdoc["_attachments"]["large"]["content_type"]);
    	unset ($newdoc["_attachments"]["large"]["data"]);

    	$newdoc["_attachments"]["small"]["digest"] = "md5-".base64_encode(md5_file($newdoc["images"]["image"][1]["uri"],true));
    	$newdoc["_attachments"]["large"]["digest"] = "md5-".base64_encode(md5_file($newdoc["images"]["image"][0]["uri"],true));
    	
    	// unset ($olddoc["_rev"]);
    	// if ($olddoc["_id"] == "9811cbb39d97b1726b86b5d07209f740"){
	    // 	$diff1 = print_r($olddoc,true);
	    // 	$diff2 = print_r($newdoc,true);
	    // 	file_put_contents("olddoc", $diff1);
	    // 	file_put_contents("newdoc", $diff2);

	    // 	print_r($olddoc);
	    // 	print_r($newdoc);

	    //     exit;

    	// }


    	// $diff1 = print_r($olddoc,true);
    	// $diff2 = print_r($newdoc,true);


    	// file_put_contents("olddoc", $diff1);
    	// file_put_contents("newdoc", $diff2);

    	//print_r($olddoc);
    	// print_r($newdoc);

        // exit;

    	//$diff = arrayRecursiveDiff($newdoc,$olddoc);
  //   	print_r($diff); 

    	$diff = arrayRecursiveDiff($olddoc,$newdoc);
		// print_r($diff);    	exit;

    	if (count($diff) == 1){
    		if (array_key_exists("_rev", $diff)){
    			//can skip
    			return false;
    		}
    	}
		//needs update

        // echo "Änderungen:\n";
        // print_r($diff);

		return true;
    }

	public function store2db($sender,$station) {

		//todo anzahl der vorherigen sendungen pro sender  vergleich und wenn weniger überschuss löschen

		$view = $this->db->get_view("epgservice", "listByPosition_view", array("[\"$station\",0]","[\"$station\",50]")); //startkey=&endkey=["ZDF",50]
		$alteAnzahl = count($view->rows);


		$sendungen = $sender->getSendungen(); //nodelist
	
		//sendung hochladen
		$imax = $sendungen->length;

		//vergleich alt neu
        echo "\n\n";
		echo "Sender $station hat $alteAnzahl alte Einträge\n";
		echo "Sender $station hat $imax neue Einträge\n";

		$i1 = 1;
		$pos = 1;
		foreach ($sendungen as $sendung) {
			$fortschritt = ($i1++)*100/$imax; $fortschritt = number_format($fortschritt, 2);
		    
			// echo "\n\n\n";
			// echo "XML:\n";
			// echo $sender->getSendungXML($sendung);
			// echo "\n\n\n";
			// echo "JSON:\n";
		    //$jsonContents = xml2json::transformXmlStringToJson($sender->getSendungXML($sendung));

			$simpleXmlElementObject = simplexml_load_string($sender->getSendungXML($sendung));	
		    $array1 = xmlToArray($simpleXmlElementObject);
		    //remove parentd node sendung
		    $array1 = $array1["sendung"];		    
		    $this->store1doc($station, $pos++, $array1, $fortschritt);		      
		}
		console("\n\tEs wurden $imax Sendungen verarbeitet");
		echo "\n\n";


		//lösche überschüssiges
		for($ix=$alteAnzahl;$ix>$imax;$ix--) {
			try {

				//hole altes doc nicht mehr by ID sondern by Pos
				$view = $this->db->get_view("epgservice", "listByPosition_view", array("[\"$station\",$ix]","[\"$station\",$ix]")); //startkey=&endkey=["ZDF",50]


				$idbyPos = $view->rows[0]->id;
			    $olddoc = $this->db->get($idbyPos, true);
			    //hier werden 2 verschiedene docs benötigt weil update nur arrays nimmt und delete nur object
   				$deletedoc->{"_rev"} = $view->rows[0]->value;
				$deletedoc->{"_id"}  = $view->rows[0]->id;

			    $this->db->delete($deletedoc);
			    $this->updateCounter($olddoc);
			    console("Position: ". $olddoc["position"] ." deleted: ".$olddoc["titel"]);
			    echo "\n";
			} catch ( Exception $e ) {
				//error Doc nicht vorhanden also neus speichern
				console("Position: ". $olddoc["position"] ."NOT deleted: ".$olddoc["titel"]);
        	}
		}

	}


	public function cleanup($all = false){
		//alles mit endtime > 24h löschen

		$all = true;
		console("Start deleting old Docs"); echo "\n";

		if ($all) {
			$view = $this->db->get_view("epgservice", "getall_view");			
		} else {
			$view = $this->db->get_list("epgservice", "getOlderThen30h", "getAllWithTimeStamp");			
		}

		//var_dump($view); exit;

		foreach ($view->rows as $row) {
			$doc = $row->value;
			console("Deleting old Doc: ".$doc->_id);
			$this->db->delete($doc);
		}
	}

}





	function arrayRecursiveDiff($aArray1, $aArray2) { 
	    $aReturn = array(); 

	    foreach ($aArray1 as $mKey => $mValue) { 
	        if (array_key_exists($mKey, $aArray2)) { 
	            if (is_array($mValue)) { 
	                $aRecursiveDiff = arrayRecursiveDiff($mValue, $aArray2[$mKey]); 
	                if (count($aRecursiveDiff)) { $aReturn[$mKey] = $aRecursiveDiff; } 
	            } else { 
	                if ($mValue != $aArray2[$mKey]) { 
	                    $aReturn[$mKey] = $mValue; 
	                } 
	            } 
	        } else { 
	            $aReturn[$mKey] = $mValue; 
	        } 
	    } 

	    return $aReturn; 
	} 

	function objectToArray($d) {
		if (is_object($d)) {
			// Gets the properties of the given object
			// with get_object_vars function
			$d = get_object_vars($d);
		}
 
		if (is_array($d)) {
			/*
			* Return array converted to object
			* Using __FUNCTION__ (Magic constant)
			* for recursive call
			*/
			return array_map(__FUNCTION__, $d);
		}
		else {
			// Return array
			return $d;
		}
	}	

	function arrayToObject($d) {
			if (is_array($d)) {
				/*
				* Return array converted to object
				* Using __FUNCTION__ (Magic constant)
				* for recursive call
				*/
				return (object) array_map(__FUNCTION__, $d);
			}
			else {
				// Return object
				return $d;
			}
	}	



