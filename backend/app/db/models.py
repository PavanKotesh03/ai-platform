import uuid
from enum import Enum
from sqlalchemy import Column, String, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase, relationship


class Base(DeclarativeBase):
    pass


class SessionStatus(str, Enum):
    PENDING = "pending"
    SUCCESS = "success"
    FAILED  = "failed"


class User(Base):
    __tablename__ = "users"

    user_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(100), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=True)

    sessions = relationship("WorkflowSession", back_populates="user")


class Workflow(Base):
    __tablename__ = "workflows"

    workflow_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workflow_name = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)

    sessions = relationship("WorkflowSession", back_populates="workflow")


class WorkflowSession(Base):
    __tablename__ = "sessions"

    session_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    workflow_id = Column(UUID(as_uuid=True), ForeignKey("workflows.workflow_id"), nullable=False)
    status = Column(String(20), nullable=False, default=SessionStatus.PENDING)
    error_message = Column(Text, nullable=True)

    user = relationship("User", back_populates="sessions")
    workflow = relationship("Workflow", back_populates="sessions")