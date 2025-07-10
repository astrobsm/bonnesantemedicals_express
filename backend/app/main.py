from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.api.v1 import api_router
from app.core.config import settings
from app.services.auth_service import create_user
from app.db.models.user import User
from app.db.session import SessionLocal
from pydantic import BaseModel
from app.api.v1.production_analysis import router as production_analysis_router
from app.api.v1.endpoints import auth
from fastapi.responses import JSONResponse, FileResponse
from fastapi.requests import Request
from fastapi.exception_handlers import RequestValidationError
from fastapi.exceptions import HTTPException

from fastapi import status
from sqlalchemy.exc import ProgrammingError, OperationalError
import os
from fastapi.staticfiles import StaticFiles


import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("uvicorn.error")

app = FastAPI(title="AstroBSM-Oracle IVANSTAMAS")

# CORS middleware for local and production frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Only allow frontend origin
    allow_credentials=True,  # Allow cookies/auth headers
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600,
)

# Log all incoming requests for debugging
@app.middleware("http")
async def log_requests(request, call_next):
    logger.info(f"Request: {request.method} {request.url}")
    response = await call_next(request)
    logger.info(f"Response status: {response.status_code}")
    return response

# Include API router
app.include_router(api_router, prefix="/api/v1")
app.include_router(production_analysis_router, prefix="/api/v1", tags=["Production Analysis"])

# Include the production analysis router
app.include_router(production_analysis_router, prefix="/api/v1/production_analysis", tags=["Production Analysis"])

# Include the auth router
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])

def create_default_admin():
    db = SessionLocal()
    admin_username = "blakvelvet"
    admin_password = "chibuike_douglas"
    admin_role = "Admin"
    try:
        # Check if the admin user already exists
        existing_admin = db.query(User).filter(User.username == admin_username).first()
        if not existing_admin:
            create_user(db, username=admin_username, password=admin_password, role=admin_role)
            print("Default admin user created.")
        else:
            print("Admin user already exists.")
    except (ProgrammingError, OperationalError) as e:
        print("[WARNING] Could not create/check admin user. Table may not exist yet.")
        print(e)
    finally:
        db.close()

# Add FastAPI startup event to create default admin after migrations
@app.on_event("startup")
def startup_event():
    create_default_admin()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class LoginRequest(BaseModel):
    username: str
    password: str
    role: str

# Comment out the login endpoint and any authentication dependencies
# @app.post("/login")
# def login(data: LoginRequest, db: Session = Depends(get_db)):
#     username = data.username
#     password = data.password
#     role = data.role
#     print(f"Login attempt: username={username}, role={role}")
#     user = authenticate_user(db, username=username, password=password, role=role)
#     if not user:
#         print("Login failed: Invalid credentials")
#         raise HTTPException(status_code=401, detail="Invalid credentials")
#     print(f"Login successful: username={user.username}, role={user.role}")
#     return {"message": "Login successful", "username": user.username, "role": user.role}

# Remove authentication dependencies from the application
# Allow unrestricted access to all routes

@app.get("/")
async def root():
    return {"message": "Welcome to AstroBSM-Oracle IVANSTAMAS API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "app": "AstroBSM-Oracle IVANSTAMAS"}

@app.get("/api/v1/customers/")
async def test_customers():
    return [{"id": 1, "name": "Test User"}]

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import traceback
    content = {
        "detail": str(exc),
        "trace": traceback.format_exc()
    }
    return JSONResponse(status_code=500, content=content)

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, content={"detail": exc.errors()})

# Serve React build static files
static_path = os.path.join(os.path.dirname(__file__), "static")
print(f"Static path: {static_path}")
print(f"Static path exists: {os.path.exists(static_path)}")
if os.path.exists(static_path):
    print(f"Static directory contents: {os.listdir(static_path)}")
    app.mount("/static", StaticFiles(directory=static_path), name="static")
    
    # Serve index.html at root for React app
    @app.get("/app")
    async def serve_react_app():
        index_path = os.path.join(static_path, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        return {"error": "React app not found"}
else:
    print("Static directory not found!")

# Serve index.html for all non-API, non-static routes (for React Router)
from starlette.requests import Request as StarletteRequest
from starlette.responses import Response as StarletteResponse

@app.exception_handler(404)
async def custom_404_handler(request: StarletteRequest, exc):
    # Only serve index.html for non-API, non-static routes
    if not request.url.path.startswith("/api") and not request.url.path.startswith("/static"):
        index_path = os.path.join(os.path.dirname(__file__), "static", "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
    return StarletteResponse("Not Found", status_code=404)

# Serve sw.js with correct MIME type (for Service Worker)
from fastapi.responses import FileResponse as FastAPIFileResponse

@app.get('/sw.js')
def service_worker():
    sw_path = os.path.join(os.path.dirname(__file__), 'static', 'sw.js')
    if os.path.exists(sw_path):
        return FastAPIFileResponse(sw_path, media_type='application/javascript')
    return StarletteResponse('Not Found', status_code=404)