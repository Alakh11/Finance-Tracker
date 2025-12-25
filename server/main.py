from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import date
import mysql.connector
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://alakh-finance.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        port=os.getenv("DB_PORT"),
        database=os.getenv("DB_NAME"),
        ssl_verify_cert=True,
        ssl_verify_identity=True
    )

# --- Data Models ---
class TransactionCreate(BaseModel):
    user_email: str
    amount: float
    type: str # 'income' or 'expense'
    category: str
    date: str # 'YYYY-MM-DD'
    payment_mode: str
    note: Optional[str] = None

class BudgetUpdate(BaseModel):
    user_email: str
    category_name: str
    limit: float

# --- Endpoints ---

@app.post("/transactions")
def add_transaction(tx: TransactionCreate):
    conn = get_db()
    cursor = conn.cursor()
    try:
        query = """
        INSERT INTO transactions 
        (user_email, amount, type, category_id, payment_mode, date, note) 
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query, (tx.user_email, tx.amount, tx.type, 1, tx.payment_mode, tx.date, tx.note))
        conn.commit()
        return {"message": "Transaction Saved"}
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@app.get("/dashboard/{email}")
def get_dashboard(email: str):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    
    # 1. Get Total Income & Expense
    cursor.execute("""
        SELECT type, SUM(amount) as total 
        FROM transactions WHERE user_email = %s GROUP BY type
    """, (email,))
    totals = cursor.fetchall()
    
    # 2. Get Recent Transactions
    cursor.execute("""
        SELECT * FROM transactions 
        WHERE user_email = %s ORDER BY date DESC LIMIT 5
    """, (email,))
    recent = cursor.fetchall()
    
    conn.close()
    return {"totals": totals, "recent": recent}

@app.get("/budgets/{email}")
def get_budgets(email: str):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    
    defaults = [('Food', '#EF4444'), ('Travel', '#F59E0B'), ('Rent', '#6366F1'), ('Shopping', '#EC4899'), ('Bills', '#10B981')]
    for name, color in defaults:
        try:
            cursor.execute("INSERT IGNORE INTO categories (user_email, name, color) VALUES (%s, %s, %s)", (email, name, color))
        except:
            pass
    conn.commit()

    # 2. Smart Query: Get Budget Limit + Amount Spent this month
    query = """
    SELECT 
        c.name, 
        c.budget_limit, 
        c.color,
        COALESCE(SUM(t.amount), 0) as spent
    FROM categories c
    LEFT JOIN transactions t 
        ON c.name = t.category_id -- Note: ideally map by ID, but for now name is okay if inconsistent
        OR (t.category_id = 1 AND c.name = 'General') -- Temporary fallback
    WHERE c.user_email = %s
    GROUP BY c.name, c.budget_limit, c.color
    """
    
    # SIMPLER QUERY for now (matching by category name directly if you stored text):
    query = """
    SELECT 
        c.name, 
        c.budget_limit, 
        c.color,
        COALESCE(SUM(t.amount), 0) as spent
    FROM categories c
    LEFT JOIN transactions t 
        ON c.name = t.note -- logic tweak: we need to ensure transaction category matches category name
        AND t.user_email = c.user_email 
        AND t.type = 'expense'
        AND MONTH(t.date) = MONTH(CURRENT_DATE()) 
        AND YEAR(t.date) = YEAR(CURRENT_DATE())
    WHERE c.user_email = %s
    GROUP BY c.name, c.budget_limit, c.color
    """
    cursor.execute(query, (email,))
    results = cursor.fetchall()
    
    conn.close()
    return results

@app.post("/budgets")
def update_budget(data: BudgetUpdate):
    conn = get_db()
    cursor = conn.cursor()
    
    query = "UPDATE categories SET budget_limit = %s WHERE user_email = %s AND name = %s"
    cursor.execute(query, (data.limit, data.user_email, data.category_name))
    
    conn.commit()
    conn.close()
    return {"message": "Budget updated"}