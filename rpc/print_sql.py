import sqlite3 
import pandas as pd 

c = sqlite3.connect('./rpc/safenode.sqlite3')
conn = c.cursor()
df = pd.read_sql_query("SELECT * FROM transactions", c)
print(df.head())
print(df['transaction_hash'][0])
print(conn.execute("SELECT * from transactions where transaction_hash = (?)",("0xc4c0ce94d59ab1477d8a4af1abf57806d164cb3fe7c2781ec263a180b7eaee94",)).fetchall())
c.close()
