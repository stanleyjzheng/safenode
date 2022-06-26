import sqlite3 
import pandas as pd 

c = sqlite3.connect('./rpc/safenode.sqlite3')
conn = c.cursor()
df = pd.read_sql_query("SELECT * FROM transactions", c)
print(df.head())
print(df.to_numpy())
df = pd.read_sql_query("SELECT * FROM world_id", c)
print(df.head())
print(df.to_numpy())
c.close()
