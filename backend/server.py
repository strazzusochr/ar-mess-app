from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

class Point(BaseModel):
    x: float
    y: float
    id: str

class MeasurementResult(BaseModel):
    distance: Optional[float] = None
    area: Optional[float] = None
    volume: Optional[float] = None
    perimeter: Optional[float] = None

class Measurement(BaseModel):
    id: str
    name: str
    mode: str
    points: List[Point]
    calibrationScale: float
    result: MeasurementResult
    unit: str
    timestamp: int
    imageData: Optional[str] = None

class MeasurementCreate(BaseModel):
    name: str
    mode: str
    points: List[Point]
    calibrationScale: float
    result: MeasurementResult
    unit: str
    imageData: Optional[str] = None

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "AR Mess-App API"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Measurement endpoints
@api_router.post("/measurements", response_model=Measurement)
async def create_measurement(measurement_data: MeasurementCreate):
    """Create a new measurement"""
    measurement = Measurement(
        id=str(uuid.uuid4()),
        timestamp=int(datetime.now().timestamp() * 1000),
        **measurement_data.dict()
    )
    
    await db.measurements.insert_one(measurement.dict())
    return measurement

@api_router.get("/measurements", response_model=List[Measurement])
async def get_measurements():
    """Get all measurements"""
    measurements = await db.measurements.find().sort("timestamp", -1).to_list(1000)
    return [Measurement(**m) for m in measurements]

@api_router.get("/measurements/{measurement_id}", response_model=Measurement)
async def get_measurement(measurement_id: str):
    """Get a specific measurement"""
    measurement = await db.measurements.find_one({"id": measurement_id})
    if not measurement:
        raise HTTPException(status_code=404, detail="Measurement not found")
    return Measurement(**measurement)

@api_router.delete("/measurements/{measurement_id}")
async def delete_measurement(measurement_id: str):
    """Delete a measurement"""
    result = await db.measurements.delete_one({"id": measurement_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Measurement not found")
    return {"message": "Measurement deleted"}

@api_router.get("/measurements/export/{measurement_id}")
async def export_measurement(measurement_id: str, format: str = "json"):
    """Export a measurement in various formats"""
    measurement = await db.measurements.find_one({"id": measurement_id})
    if not measurement:
        raise HTTPException(status_code=404, detail="Measurement not found")
    
    # Remove MongoDB's _id field to avoid serialization issues
    if "_id" in measurement:
        del measurement["_id"]
    
    if format == "json":
        return measurement
    elif format == "csv":
        # Simple CSV export
        return {
            "name": measurement["name"],
            "mode": measurement["mode"],
            "result": measurement["result"],
            "timestamp": measurement["timestamp"]
        }
    
    return measurement

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
