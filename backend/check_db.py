
from supabase import create_client

def check_table():
    url = "https://qdhbiuqtbirttuitapgl.supabase.co"
    key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkaGJpdXF0YmlydHR1aXRhcGdsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE1MzI5NywiZXhwIjoyMDg4NzI5Mjk3fQ.ct27fAoUsNf8RnKVi6iFh5MaY7eQEXWed9bIBICu8H4"
    
    supabase = create_client(url, key)
    
    print("Listing columns of 'daily_check_ins' table...")
    try:
        res = supabase.table("daily_check_ins").select("*").limit(1).execute()
        if res.data:
            print("Row found, columns:", res.data[0].keys())
        else:
            print("Table empty, cannot see columns easily. Trying to describe via RPC if available or just proceed with assumption.")
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    check_table()
