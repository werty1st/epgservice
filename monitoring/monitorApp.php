<?php


$user_agent = 'PHP, ZDF Webmaster (dev)';
//$url = "http://wmaiz-v-sofa01.dbc.zdf.de/epgservice/status";
$url = "http://sofa01.zdf.de/epgservice/status";
//$url = "http://172.29.30.23:8787/";

$ch = curl_init($url);
curl_setopt($ch,  CURLOPT_RETURNTRANSFER, TRUE);
curl_setopt ($ch, CURLOPT_USERAGENT, $user_agent); 
curl_setopt ($ch, CURLOPT_TIMEOUT, 2); //1sec timeout


/* Get the HTML or whatever is linked in $url. */
$response = curl_exec($ch);

/* Get curl error code*/
$retcode = curl_errno($ch);
// echo "retcode $retcode"; // 28 == timeout

/* Check for 404 (file not found). */
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);


if ($httpCode > 200) {
	echo "Sende Mail wegen Fehler: $httpCode\n";
	sende_mail($response);

} else if ($retcode > 0){

	if ($retcode==28){
		$retcode="Timeout";
		echo "restart couchdb\n";
		$result=restart_couch();
		echo $result."\n";
	}
        echo "Sende Mail wegen Fehler: $retcode\n";
        sende_mail($response."\n".$result);

} else {
 echo "Kein Fehler.\n";
}

function restart_couch(){

	return shell_exec("/sbin/restart couchdb");
}

function sende_mail($antwort) {

	# Additional site configuration settings. Allows to override global settings.
	if (file_exists('emailadressen')) {
		$empfänger_liste = file('emailadressen',FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
	}

	if (!is_array($empfänger_liste))
		$empfänger_liste = array($empfänger_liste);

	foreach ($empfänger_liste as $empfänger) {

		echo "Sende Mail an Empfänger: $empfänger\n";
		mail ( $empfänger , "EPG Service - Status Report" , $antwort);
	}
	
}


