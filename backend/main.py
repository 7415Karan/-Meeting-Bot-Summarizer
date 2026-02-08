from dotenv import load_dotenv
# Only load .env file in development (local)
import os
if os.path.exists(".env"):
    load_dotenv(override=True)

from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import Optional
import shutil
import json

from database import SessionLocal, engine
from models import Meeting
from llm import generate_meeting_summary, transcribe_audio

from database import Base
Base.metadata.create_all(bind=engine)

os.makedirs("uploads", exist_ok=True)

app = FastAPI()

# Get the frontend URL from environment variable, or default to local
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
if not FRONTEND_URL.startswith("http"):
    FRONTEND_URL = f"https://{FRONTEND_URL}"

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    FRONTEND_URL 
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/meeting/create")
def create_meeting(
    title: str = Form(...),
    meeting_type: str = Form(...),
    transcript: str = Form(None),
    file: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    file_path = None

    if file and file.filename:
        # Secure filename to prevent path traversal
        file_path = f"uploads/{os.path.basename(file.filename)}"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

    if not transcript and file_path:
        transcript = transcribe_audio(file_path)
    elif not transcript:
        transcript = " [Transcription Placeholder] "

    ai_result = generate_meeting_summary(transcript)

    meeting = Meeting(
        title=title,
        meeting_type=meeting_type,
        transcript=transcript,
        ai_output=json.dumps(ai_result),
        file_path=file_path
    )

    db.add(meeting)
    db.commit()
    db.refresh(meeting)

    return {"id": meeting.id, "result": ai_result}

@app.get("/meetings")
def list_meetings(search: Optional[str] = None, type: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Meeting)
    if search:
        query = query.filter(Meeting.title.contains(search))
    if type:
        query = query.filter(Meeting.meeting_type == type)
    return query.all()

@app.get("/meetings/{meeting_id}")
def get_meeting(meeting_id: int, db: Session = Depends(get_db)):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return meeting

@app.delete("/meetings/{meeting_id}")
def delete_meeting(meeting_id: int, db: Session = Depends(get_db)):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    db.delete(meeting)
    db.commit()
    return {"message": "Deleted"}
