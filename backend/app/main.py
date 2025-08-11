from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.api.v1 import api_router
from app.core.config import settings
from app.services.auth_service import create_user
from app.db.models.user import User
from app.db.session import SessionLocal, async_session_maker
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

# Log startup information
logger.info("🚀 Starting AstroBSM-Oracle IVANSTAMAS API")
logger.info(f"📁 Current working directory: {os.getcwd()}")
logger.info(f"🔧 FastAPI app created successfully")

# Validate environment configuration
logger.info(f"🌍 Environment: {settings.ENVIRONMENT}")
logger.info(f"🔒 Debug mode: {settings.DEBUG}")

# Validate DATABASE_URL (without logging sensitive info)
if settings.DATABASE_URL:
    if settings.DATABASE_URL.startswith("postgresql://"):
        logger.info("✅ PostgreSQL DATABASE_URL configured")
    else:
        logger.warning("⚠️  DATABASE_URL does not appear to be PostgreSQL")
else:
    logger.error("❌ DATABASE_URL not configured")

# Validate SECRET_KEY
if settings.SECRET_KEY and len(settings.SECRET_KEY) > 20:
    logger.info("✅ SECRET_KEY configured")
else:
    logger.warning("⚠️  SECRET_KEY appears to be default or too short")

# Port validation
port = int(os.environ.get('PORT', 8080))
logger.info(f"🌐 Application will run on port: {port}")

app = FastAPI(title="AstroBSM-Oracle IVANSTAMAS")

# CORS middleware for local and production frontend
allowed_origins = ["*"]  # Allow all origins in production for now
if settings.ENVIRONMENT == "development":
    allowed_origins = ["http://localhost:3000", "http://127.0.0.1:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
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

# Include fingerprint router
try:
    from app.api.v1.endpoints.fingerprint import router as fingerprint_router
    app.include_router(fingerprint_router, prefix="/api/v1", tags=["Fingerprint"])
    logger.info("✅ Fingerprint endpoints loaded successfully")
except ImportError as e:
    logger.warning(f"⚠️  Fingerprint module not available: {e}")
except Exception as e:
    logger.error(f"❌ Error loading fingerprint endpoints: {e}")

import sqlalchemy
from sqlalchemy.future import select
import asyncio
async def create_default_admin():
    admin_username = "blakvelvet"
    admin_password = "chibuike_douglas"
    admin_role = "Admin"
    try:
        async with async_session_maker() as db:
            result = await db.execute(select(User).where(User.username == admin_username))
            existing_admin = result.scalars().first()
            if not existing_admin:
                await create_user(db, username=admin_username, password=admin_password, role=admin_role)
                print("Default admin user created.")
            else:
                print("Admin user already exists.")
    except (ProgrammingError, OperationalError) as e:
        print("[WARNING] Could not create/check admin user. Table may not exist yet.")
        print(e)

# Add FastAPI startup event to run migrations and create default admin
@app.on_event("startup")
async def startup_event():
    # Skip database operations if SKIP_DATABASE is set
    if os.environ.get("SKIP_DATABASE") == "true":
        logger.info("⚠️ SKIP_DATABASE is set - skipping database operations")
        logger.info("🔐 Fingerprint service will run in simulation mode")
        return
        
    logger.info("🔄 Running database migrations...")
    try:
        import subprocess
        import sys
        # Use the correct migration path for Alembic (backend directory relative to this file)
        migration_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../'))
        if not os.path.exists(os.path.join(migration_path, 'alembic.ini')):
            migration_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../backend'))
        result = subprocess.run([
            sys.executable, "-m", "alembic", "upgrade", "head"
        ], capture_output=True, text=True, cwd=migration_path)
        if result.returncode == 0:
            logger.info("✅ Database migrations completed successfully")
        else:
            logger.error(f"❌ Migration failed: {result.stderr}")
    except Exception as e:
        logger.error(f"❌ Migration error: {e}")
    # Now create admin user
    from app.db.session import async_session_maker as imported_async_session_maker
    global async_session_maker
    if async_session_maker is None:
        async_session_maker = imported_async_session_maker
    await create_default_admin()

async def get_db():
    if async_session_maker is None:
        from app.db.session import async_session_maker as imported_async_session_maker
        session_maker = imported_async_session_maker
    else:
        session_maker = async_session_maker
    async with session_maker() as db:
        yield db

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
    logger.info("🏠 Root endpoint accessed - serving React app")
    # Serve the React app index.html for the root route
    static_path = os.path.join(os.path.dirname(__file__), "static")
    index_path = os.path.join(static_path, "index.html")
    logger.info(f"🌐 Serving React app from: {index_path}")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    else:
        # Fallback to API response if React app not found
        return {
            "message": "Welcome to AstroBSM-Oracle IVANSTAMAS API", 
            "status": "running", 
            "timestamp": "2025-07-10",
            "environment": os.getenv("ENVIRONMENT", "development"),
            "error": "React app not found at expected path"
        }

@app.get("/api/status")
async def api_status():
    logger.info("📊 API status endpoint accessed")
    return {
        "message": "Welcome to AstroBSM-Oracle IVANSTAMAS API", 
        "status": "running", 
        "timestamp": "2025-07-10",
        "environment": os.getenv("ENVIRONMENT", "development")
    }

@app.get("/health")
async def health_check():
    logger.info("💚 Health check accessed")
    static_path = os.path.join(os.path.dirname(__file__), "static")
    return {
        "status": "healthy", 
        "app": "AstroBSM-Oracle IVANSTAMAS",
        "static_files_exist": os.path.exists(static_path),
        "static_files": os.listdir(static_path) if os.path.exists(static_path) else [],
        "environment": os.getenv("ENVIRONMENT", "development")
    }

@app.get("/test")
async def test_endpoint():
    logger.info("🧪 Test endpoint accessed")
    return {"test": "success", "message": "API is working correctly"}

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
logger.info(f"📁 Static path: {static_path}")
logger.info(f"✅ Static path exists: {os.path.exists(static_path)}")
if os.path.exists(static_path):
    files = os.listdir(static_path)
    logger.info(f"📂 Static directory contents: {files}")
    app.mount("/static", StaticFiles(directory=static_path), name="static")
    
    # Serve index.html at /app for React app
    @app.get("/app")
    async def serve_react_app():
        index_path = os.path.join(static_path, "index.html")
        logger.info(f"🌐 Serving React app from: {index_path}")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        return {"error": "React app not found"}
        
    # Also serve React app at root with fallback
    @app.get("/frontend")
    async def serve_frontend():
        index_path = os.path.join(static_path, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        return {"error": "Frontend not found", "static_path": static_path}
else:
    logger.error("❌ Static directory not found!")
    logger.error(f"❌ Expected path: {static_path}")

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