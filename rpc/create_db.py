import sqlite3 as sqlite
import random

def create_database():
    conn = sqlite.connect('./rpc/safenode.sqlite3') 
    c = conn.cursor()

    c.execute("""
    CREATE TABLE IF NOT EXISTS individual_recipient_whitelist (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_address TEXT,
        recipient_address TEXT
    )
    """)

    c.execute("""
    CREATE TABLE IF NOT EXISTS global_contract_whitelist(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        address TEXT,
        reason TEXT
    )
    """)

    c.execute("""
    CREATE TABLE IF NOT EXISTS global_recipient_blacklist(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        address TEXT,
        reason TEXT
    )
    """)

    c.execute("""
    CREATE TABLE IF NOT EXISTS world_id(
        address TEXT PRIMARY KEY,
        count INTEGER
    )
    """)

    c.execute("""
    CREATE TABLE IF NOT EXISTS warn_list(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        complainer_address TEXT,
        complainer_signature TEXT,
        complainer_ens TEXT,
        troubled_address TEXT,
        complaint_reason TEXT
    )
    """)

    # transaction type is one of 0 (value), 1 (erc721/erc20 transfer/approval events)
    # safety is one of 0 (inpermissible, due to irretrievable funds or known blacklisted address) (show simulation)
    # 1, warnings, due to other reports (show simulation)
    # 2. warning, but only because of new address, show simulation for transfer/approval events
    # 3. permit, redirect to etherscan because it's whitelisted in some way
    # complaints, simulation is base64 json encoded lists
    c.execute("""
    CREATE TABLE IF NOT EXISTS transactions(
        transaction_hash TEXT PRIMARY KEY,
        from_address TEXT,
        to_address TEXT,
        value TEXT,
        gas_price INT,
        gas_limit INT,
        gas_used INT,
        errors TEXT,
        warnings TEXT,
        simulation TEXT,
        raw_transaction TEXT,
        world_id INT
    )
    """)
    conn.close()

def random_hex_string(l):
    hex_chars = '1234567890abcdef'
    o = '0x'
    
    for i in range(l):
        o += str(hex_chars[random.randint(0, 15)])
    return o

def generate_bogus_data():
    conn = sqlite.connect('./rpc/safenode.sqlite3') 
    c = conn.cursor()

    c.execute(f"INSERT INTO individual_recipient_whitelist (sender_address, recipient_address) VALUES(?, ?)", (random_hex_string(40), random_hex_string(40)))
    c.execute(f"INSERT INTO global_contract_whitelist (address, reason) VALUES(?, ?)", (random_hex_string(40), 'Official OpenSea contract address'))
    c.execute(f"INSERT INTO global_recipient_blacklist (address, reason) VALUES(?, ?)", (random_hex_string(40), 'this guy straight up sucks, scammed me'))
    c.execute(f"""INSERT INTO warn_list (
        complainer_address, 
        complainer_signature, 
        complainer_ens, 
        troubled_address, 
        complaint_reason
        ) 
        VALUES(?, ?, ?, ?, ?)""", (
        random_hex_string(40),
        "0xtotallyrealsignature",
        "0xlmeow.eth",
        random_hex_string(40),
        "this guy sucks turst"
    ))

    # on second thought maybe we should put warnings/errors in transactions table
    # so that the frontend doesn't need any logic to handle them
    c.execute(f"""INSERT INTO transactions (
        transaction_hash,
        from_address,
        to_address,
        value,
        gas_price,
        gas_limit,
        gas_used,
        errors,
        warnings,
        simulation,
        raw_transaction,
        world_id
    ) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""", (
        random_hex_string(64),
        random_hex_string(40),
        random_hex_string(40),
        '2.000',
        18000000000,
        73189,
        43758,
        'big error',
        'smol warning',
        'somebase64jsonsomethingsomething',
        '0xtotallyrealrawsignedtransaction',
        2
    ))

    conn.commit()
    conn.close()

    print('bogus data generated.')


create_database()
generate_bogus_data() 
