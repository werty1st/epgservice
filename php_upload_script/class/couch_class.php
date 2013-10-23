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

        return;

		//throw new Exception('Not implemented yet.');
		//speichere zeit und sender für änderungsxml
        echo "Update XXXXXXXXXXXXXXXX\n\n";

        $timestampDoc = (object)null;

        $timestampDoc->{"_id"}       = $doc["station"]["name"] ."_latest";
        $timestampDoc->id            = $doc["station"]["name"] ."_latest";
        $timestampDoc->type          = "lastmodified";
        $timestampDoc->station->name = $doc["station"]["name"];
        $timestampDoc->timestamp     = date_format(new DateTime("now", new DateTimeZone ( "Europe/Berlin" )), DateTime::ATOM);
        //$timestampDoc->{"_rev"} = $doc["_rev"];

        var_dump(json_encode($timestampDoc)); exit;

        //todo settee kann kein update wechsel to php on couch oder http://www.saggingcouch.com/

        $olddoc = $this->db->get($docid,true);
        $response = $this->db->save($doc);

	}

    private function store1doc($doc, $fortschritt) {

		$docid = $doc["_id"];

		// echo "docid: $docid\n";
		try {
		    $olddoc = $this->db->get($docid,true);
		    $olddocrev = $olddoc["_rev"];	
		    //echo "Document $docid already exists!\n";
	
			//no error Doc schon vorhanden
			if ($this->updateORskip($olddoc, $doc)){
				//update
				$doc["_rev"] = $olddoc["_rev"];		
				console("Updateing doc: ".$doc["_id"]." with revision: ".$doc["_rev"]);
				echo "\n";
				$this->updateCounter($doc);
			} else {
				//echo "Document $docid needs no update!\n\n";
				return;
			}
		} catch ( Exception $e ) {
			//error Doc nicht vorhanden
			//echo "Document $docid not exists!\n\n";

			//irgend ein fehler filter für 404 wäre schön
			
		    // if ( $e->getCode() == 404 ) {
		    // 	echo "Document $docid does not exist!\n";
		    // } else {
		    // 	$error = json_decode($e->getMessage());
		    // 	print_r($error);
		    // 	exit;
		    // 	throw new Exception("DB Error: ". $e->getMessage());
		    // }
		}	    
	    
		/* NEU NEU NEU
		** get Range
			http://localhost:9999/epgservice/_design/epgservice/_
			view/getRangeStartEndTime?startkey=["ZDF","2013-10-22T12:00:00+02:00"]&endkey=["ZDF","2013-10-22T15:00:00+02:00"]
		*/
		if ($this->machMirPlatz($doc)){
            $this->updateCounter($doc);
        }

    	$response = $this->db->save($doc);	    	// couchConflictException

		//neue revision:
		//echo "updated revision: ".$response->_rev."\n";		

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
                //$this->db->delete("{ \"_id\": \"$id\", \"_rev\": \"$rev\" }");
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

    	if (count($diff) == 1){
    		if (array_key_exists("_rev", $diff)){
    			//can skip
    			return false;
    		}
    	}
		//needs update
		return true;
    }

	public function store2db($sender) {

		$sendungen = $sender->getSendungen(); //nodelist
	
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
		console("Es wurden $imax Sendungen gespeichert");
		echo "\n";
	}

	// private function object2array($data) {
	//     if (is_array($data) || is_object($data))
	//     {
	//         $result = array();
	//         foreach ($data as $key => $value)
	//         {
	//             $result[$key] = $this->object2array($value);
	//         }
	//         return $result;
	//     }
	//     return $data;
	// }

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



