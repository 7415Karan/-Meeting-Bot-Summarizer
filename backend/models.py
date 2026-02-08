from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from database import Base

class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    meeting_type = Column(String)
    transcript = Column(Text)
    ai_output = Column(Text)
    file_path = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
