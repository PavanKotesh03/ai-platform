import uuid
import enum
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, JSON, Text, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class SessionStatus(str, enum.Enum):
    PENDING = "pending"
    RUNNING = "running"
    SUCCESS = "success"
    FAILED  = "failed"


class Session(Base):
    __tablename__ = "sessions"

    # Primary key
    session_id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )

    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.user_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    workflow_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("workflows.workflow_id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    status: Mapped[SessionStatus] = mapped_column(
        SAEnum(SessionStatus, values_callable=lambda x: [e.value for e in x]),
        nullable=False,
        default=SessionStatus.PENDING,
    )

    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)


    user: Mapped["User"] = relationship("User", back_populates="sessions")
    workflow: Mapped["Workflow"] = relationship("Workflow", back_populates="sessions")

    def __repr__(self) -> str:
        return (
            f"<Session session_id={self.session_id} "
            f"user_id={self.user_id} workflow_id={self.workflow_id} "
            f"status={self.status}>"
        )