"""
Script to add 'date_of_birth' column to existing customers table
Run this once to update the database schema
"""
import sqlite3
import os

# Database path
db_path = "rewards.db"

if not os.path.exists(db_path):
    print(f"Database file {db_path} not found!")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    # Check if column already exists
    cursor.execute("PRAGMA table_info(customers)")
    columns = [column[1] for column in cursor.fetchall()]
    
    if 'date_of_birth' in columns:
        print("Column 'date_of_birth' already exists in customers table.")
    else:
        # Add the date_of_birth column
        cursor.execute("ALTER TABLE customers ADD COLUMN date_of_birth DATETIME")
        conn.commit()
        print("✓ Successfully added 'date_of_birth' column to customers table")
    
    # Show current schema
    cursor.execute("PRAGMA table_info(customers)")
    print("\nCurrent customers table schema:")
    for column in cursor.fetchall():
        print(f"  - {column[1]} ({column[2]})")
    
except Exception as e:
    print(f"Error: {str(e)}")
    conn.rollback()
finally:
    conn.close()

