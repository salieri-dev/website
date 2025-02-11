from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

# Import and include routers
from .routes import static

app = FastAPI()
app.include_router(static.router)

# Mount static files directory
app.mount("/static", StaticFiles(directory="static"), name="static")
