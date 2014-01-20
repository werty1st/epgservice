<?php


$user_agent = 'PHP, ZDF Webmaster (dev)';
#$url = "http://wmaiz-v-sofa01.dbc.zdf.de/epgservice/status";
$url = "http://sofa01.zdf.de/epgservice/status";

$ch = curl_init($url);
curl_setopt($ch,  CURLOPT_RETURNTRANSFER, TRUE);
curl_setopt ($ch, CURLOPT_USERAGENT, $user_agent); 


/* Get the HTML or whatever is linked in $url. */
$response = curl_exec($ch);

/* Check for 404 (file not found). */
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
if($httpCode != 200) {    
	echo "sende Mail wegen Fehler $httpCode\n";
	sende_mail($response);

} else {
 echo "Kein fehler\n";
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


