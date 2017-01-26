<?php 
class main {
	
	function __construct()
	{
		$url = [];
		if(isset($_SERVER['PATH_INFO'])){
			$url = $_SERVER['PATH_INFO'];
			$url = trim($url, '/');
			if($url==''){
				$url = ['home', 'index'];
			}else{
				$url =  explode('/', $url);
			}
			if(isset($url[1])==false){
				array_push($url, 'index');
			}
		}

	}

}
