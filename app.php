<?php 
class app {

	private $db;
	
	function __construct()
	{
		try {
			$pdo = new PDO('mysql:host=localhost; dbname=zenrooms', 'root', 'oomNouj', [PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8"]);
			$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
			$pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
			$pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
			$this->db = $pdo;
		} catch (PDOException $e) {
			echo "DataBase Error: ".$e->getMessage();
		}

		$urlData = [];
		if(isset($_SERVER['PATH_INFO'])){
			$urlData = $_SERVER['PATH_INFO'];
			$urlData = trim($urlData, '/');
			if($urlData!=''){
				$urlData =  explode('/', $urlData);
			}
		}

		if(count($urlData) > 0){
			$functionName = $urlData[0];
			unset($urlData[0]);
			if(method_exists($this, $functionName)){
				call_user_func_array([$this, $functionName], $urlData);
			}else{
				echo 'Page not found';
			}
		}
	}

	private function getRoomTypes()
	{
		try {
			$stmt = $this->db->prepare('select * from roomtype');
			$stmt->execute();
			echo json_encode($stmt->fetchAll());
		} catch (PDOException $e) {
		  echo "DataBase Error: ".$e->getMessage();
		} catch (Exception $e) {
		  echo "General Error: ".$e->getMessage();
		}
	}

	private function getRates()
	{
		try {
			$stmt = $this->db->prepare('');
			$stmt->execute();
			
		} catch (PDOException $e) {
		  echo "DataBase Error: ".$e->getMessage();
		} catch (Exception $e) {
		  echo "General Error: ".$e->getMessage();
		}
	}

	private function setRate()
	{
		
	}

}

new app();
