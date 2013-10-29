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

        //todo settee kann kein update wechsel to php on couch oder http://www.saggingcouch.com/

        $response = $this->db->save($last_mod_doc);
        // var_dump($last_mod_doc );
        // var_dump($doc["station"]["name"]); sleep(5);
	}

    private function store1doc($doc, $fortschritt) {

		$docid = $doc["_id"];
        $now   = date_format(new DateTime("now", new DateTimeZone ( "Europe/Berlin" )), DateTime::ATOM);

		// echo "docid: $docid\n";
		try {
		    $olddoc = $this->db->get($docid,true);
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
				
				echo "\n";
                console("Updateing doc: ".$doc["_id"]." with revision: ".$doc["_rev"]);

                $doc["item_created"] = $old_item_created;
                $doc["item_modified"] = $now;

				$this->updateCounter($doc);
			} else {                
                echo "\n\tDocument $docid needs no update!\t";
				return;
			}
		} catch ( Exception $e ) {
			//error Doc nicht vorhanden also neus speichern
        }       
	    

		$this->machMirPlatz($doc);
       

        if (!array_key_exists("item_created", $doc)){
            //echo"\n\tDocument ".$doc["_id"]." is new\t";
            $doc["item_created"]  = $now;
            $doc["item_modified"] = $now;

        }
        $response = $this->db->save($doc);          // couchConflictException

        $this->updateCounter($doc);
	

	    if (microtime(true) - $this->counter > 0.2) {
	    	$this->counter = microtime(true);
	   		$out = $fortschritt."% verarbeite Document: ". $doc["titel"];
	 		console($out);				
		}
    }

    private function machMirPlatz($doc) {

    	//Startkey
    	// $startkey = '["'.$doc["station"]["name"].'","'.$doc["time"].'"]';
    	// $endkey   = '["'.$doc["station"]["name"].'","'.$doc["endTime"].'"]';

    	// $startkey = urlencode($startkey);
    	// $endkey = urlencode($endkey);
		
		//startkey=["ZDF","2013-10-22T12:00:00+02:00"]&endkey=["ZDF","2013-10-22T15:00:01+02:00"]
    	//$url = "startkey="

        $platzGeschaffen = false;
        $na = $doc["time"];
        $ne = $doc["endTime"];



    	$view = $this->db->get_view("epgservice", "getRangeStartEndTime", $doc["station"]["name"]);

    	foreach ($view->rows as $row) {
            $id = $row->id;
            $startzeit = $aa = $row->value[0];
            $endzeit   = $ae = $row->value[1];
            $rev     = $row->value[2];
    		$titel     = $row->value[3];

            if(( $ne > $aa && $ne < $ae) ||
              ( $na > $aa && $na < $ae) ||
              ( $na < $aa && $ne > $ae)) {                
                //Überschneidung löschen

                //neues doc
                echo "\n";
                echo "doc sendung: ". $doc["titel"]."\n";
                echo "doc start: ". $doc["time"]."\n";
                echo "doc ende : ". $doc["endTime"]."\n\n";

                //altes doc
                $this->db->delete("{ \"_id\": \"$id\", \"_rev\": \"$rev\" }");
                $platzGeschaffen = true;
                echo "Lösche veraltetes Programm:\n";
                echo "db sendung: $titel\n";
                echo "db start: $startzeit\n";
                echo "db ende : $endzeit\n\n";
              }            
        }

        return $platzGeschaffen;
    }

    private function updateORskip($doc1,$doc2){

    	$diff = arrayRecursiveDiff($doc1,$doc2);
    	// print_r($diff);
        // exit;

    	if (count($diff) == 1){
    		if (array_key_exists("_rev", $diff)){
    			//can skip
    			return false;
    		}
    	}
		//needs update

        echo "Änderungen:\n";
        print_r($diff);

		return true;
    }

	public function store2db($sender) {

		$sendungen = $sender->getSendungen(); //nodelist
        echo "\n";
	
		//sendung hochladen
		$imax = $sendungen->length;
		$i1 = 1;
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
		    $this->store1doc($array1, $fortschritt);		      
		}
		console("Es wurden $imax Sendungen verarbeitet");
		echo "\n";
	}

	public function cleanup($all = false){
		//alles mit endtime > 24h löschen

		console("Start deleting old Doc"); echo "\n";

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



