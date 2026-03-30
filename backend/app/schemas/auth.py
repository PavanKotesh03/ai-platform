from pydantic import BaseModel, EmailStr, Field
import uuid


class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class MessageResponse(BaseModel):
    message: str


class UserResponse(BaseModel):
    user_id: uuid.UUID
    username: str
    email: EmailStr

    class Config:
        from_attributes = True