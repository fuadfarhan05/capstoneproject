from fastapi import FastAPI
from app.routes.events import router as events_router
#entry point for app

app = FastAPI() # initialize fastapi app 
app.include_router(events_router, prefix="/api")




@app.get("/")
async def root():
    return{"message": "Hello World"}

@app.get("/health")
async def health_check():
    return {"status": "ok"}


# @app.get("/api/schedule") #schedule of events for a user
# def getuserschedule(user_id, date=None):
#     return {"events": events}

# @app.post("/api/create_event") #xcreate new event
# def create_event():
#     return {"message": "Create event endpoint coming soon"}
