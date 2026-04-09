from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

order = {"status": "PENDING"}

@app.get("/order")
def get_order():
    return order

@app.post("/pay")
def pay():
    order["status"] = "PAID"
    return order

@app.post("/ship")
def ship():
    # 🔴 bug
    order["status"] = "SHIPPED"
    return order

@app.post("/reset")
def reset():
    order["status"] = "PENDING"
    return order
