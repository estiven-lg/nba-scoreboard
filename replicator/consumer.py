import re
import pika
import json
import requests
import time
import logging

from dotenv import load_dotenv
import os

load_dotenv() 
# Configurar logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger()

COUCH_URL = os.getenv("COUCHDB_URL")
COUCH_DB_URL = COUCH_URL + "/nba_reports/"

def wait_for_services():
    """Esperar a que los servicios estén disponibles"""
    logger.info("Waiting for services to be ready...")
    
    # Esperar por RabbitMQ
    for i in range(30):
        try:
            connection = pika.BlockingConnection(pika.ConnectionParameters(host='rabbitmq'))
            connection.close()
            logger.info("RabbitMQ is ready!")
            break
        except Exception as e:
            logger.warning(f"Waiting for RabbitMQ... {i+1}/30")
            time.sleep(2)
    else:
        logger.error("RabbitMQ not available after 60 seconds")
        return False
    
    # Esperar por CouchDB
    for i in range(30):
        try:
            response = requests.get(COUCH_URL + "/_utils/", timeout=5)
            if response.status_code == 200:
                logger.info("CouchDB is ready!")
                break
        except Exception as e:
            logger.warning(f"Waiting for CouchDB... {i+1}/30")
            time.sleep(2)
    else:
        logger.error("CouchDB not available after 60 seconds")
        return False
    
    return True

def setup_couchdb():
    """Configurar la base de datos en CouchDB"""
    try:
        if requests.head(COUCH_DB_URL).status_code == 404:
            logger.info("Creating database nba_reports")
            requests.put(COUCH_URL + "/users")
            requests.put(COUCH_URL + "/_replicator")
            requests.put(COUCH_URL + "/_global_changes")
            response = requests.put(COUCH_DB_URL)

            logger.info(f"Database created: {response.status_code}")
        else:
            logger.info("Database nba_reports already exists")
    except Exception as e:
        logger.error(f"Error setting up CouchDB: {e}")

def callback(ch, method, properties, body):
    logger.info(f" [x] Received message: {body}")
    try:
        message = json.loads(body)
        action = message.get("Action")
        data = message.get("Data")
        
        logger.info(f"Processing action: {action} with data: {data}")
        
        if action == "POST":
            response = requests.post(COUCH_DB_URL, json=data)
            logger.info(f"POST to CouchDB: {response.status_code}")
        elif action == "PUT":
            rev = requests.get(f"{COUCH_DB_URL}/{data['_id']}").json()['_rev']
            data['_rev'] = rev
            response = requests.put(f"{COUCH_DB_URL}/{data['_id']}", json=data)
            logger.info(f"PUT to CouchDB: {response.status_code}")
        elif action == "DELETE":
            rev = requests.get(f"{COUCH_DB_URL}/{data['_id']}").json()['_rev']
            data['_rev'] = rev
            data['_deleted'] = True
            response = requests.put(f"{COUCH_DB_URL}/{data['_id']}", json=data)
            logger.info(f"DELETE from CouchDB: {response.status_code}")
        else:
            logger.warning(f"Unknown action: {action}")
            
    except Exception as e:
        logger.error(f"Error processing message: {e}")

def main():
    if not wait_for_services():
        return
    
    setup_couchdb()
    
    try:
        connection = pika.BlockingConnection(pika.ConnectionParameters(
            host='rabbitmq',
            heartbeat=600
        ))
        channel = connection.channel()
        
        # Declarar cola y verificar mensajes
        queue = channel.queue_declare(queue='game_data', durable=True)
        logger.info(f"Queue 'game_data' declared with {queue.method.message_count} messages")
        
        channel.basic_consume(queue='game_data', on_message_callback=callback, auto_ack=True)
        
        logger.info(" [*] Starting to consume messages...")
        channel.start_consuming()
        
    except KeyboardInterrupt:
        logger.info("Interrupted by user")
    except Exception as e:
        logger.error(f"Error in main: {e}")
    finally:
        try:
            connection.close()
        except:
            pass

if __name__ == "__main__":
    main()