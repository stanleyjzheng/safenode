from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
import uvicorn 
import httpx 

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/{path:path}")
async def tile_request(path: str, response: Response):
    print(path)
    async with httpx.AsyncClient() as client:
        proxy = await client.get(f"https://eth-mainnet.alchemyapi.io/v2/QTgdSeKUblwBTGRrH0pOTYMCFHUqxxIa/{path}")
    response.body = proxy.content
    response.status_code = proxy.status_code
    return response

@app.post("/")
async def tile_request(path: str):
    print(path)

if __name__ == "__main__":
    uvicorn.run(app, debug=True)
