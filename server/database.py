# server/database.py
import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host=os.getenv("DB_HOST"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            port=os.getenv("DB_PORT"),
            database=os.getenv("DB_NAME"),
            ssl_ca="/etc/ssl/certs/ca-certificates.crt",
            ssl_disabled=False
        )
        return connection
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return None