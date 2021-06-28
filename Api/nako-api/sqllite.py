import sqlite3 as db
import util
import logging

db_path = "./nako.db"
timestamp = util.return_timestamp()
logging.basicConfig(format='%(asctime)s:%(levelname)-8s:%(message)s', datefmt='%Y-%m-%d %H:%M:%S', filename='nako.log',
                    filemode='a', level=0)


def connect_db(str):
    logging.info(str)
    conn = db.connect(db_path)
    c = conn.cursor()
    try:
        c.execute(str)
        result = c.fetchall()
        conn.commit()
        conn.close()
        print(timestamp, "DB: Sqlite query successful ...")
        logging.info('DB: Sqlite query successful ...')
        print(timestamp, "query result:", result)
        return result

    except Exception as e:
        print(timestamp, "Exception:", e)
        logging.warning(e)
