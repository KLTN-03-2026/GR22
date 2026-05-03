# Module: api/models.py - Quản lý logic hệ thống
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Union, Any

class Experience(BaseModel):
    position: str
    company: str
    time: str
    description: Union[str, List[str]] = []
    technical: Optional[Union[str, List[str]]] = None

    @field_validator('description', 'technical')
    @classmethod
    def join_list(cls, v):
        if isinstance(v, list):
            return ", ".join(v)
        return v

class Education(BaseModel):
    degree: str
    university: str
    time: str

class Project(BaseModel):
    name: str
    time: str
    position: str
    description: Union[str, List[str]]
    tech_stack: List[str] = []

    @field_validator('description')
    @classmethod
    def join_list(cls, v):
        if isinstance(v, list):
            return ". ".join(v)
        return v

class CVData(BaseModel):
    full_name: str
    job_title: Optional[Union[str, List[str]]] = None
    email: Optional[Union[str, List[str]]] = None
    phone: Optional[Union[str, List[str]]] = None
    location: Optional[Union[str, List[str]]] = None
    github: Optional[Union[str, List[str]]] = None
    about_me: Optional[Union[str, List[str]]] = None
    skills: dict = {}
    experience: List[Experience] = []
    education: List[Education] = []
    projects: List[Project] = []

    @field_validator('full_name', 'job_title', 'email', 'phone', 'location', 'github', 'about_me')
    @classmethod
    def join_list(cls, v):
        if isinstance(v, list):
            return " ".join(v)
        return v

class CVRecommendationInput(BaseModel):
    full_name: Optional[Any] = "N/A"
    job_title: Optional[Any] = None
    about_me: Optional[Any] = None
    skills: Any = {}
    experience: Any = []
    education: Any = []
    projects: Any = []

class JobInput(BaseModel):
    id: Optional[Any] = None
    title: Optional[Any] = "Untitled"
    description: Optional[Any] = ""
    requirements: Optional[Any] = ""
    location: Optional[Any] = None
    salary: Optional[Any] = None

class RecommendationRequest(BaseModel):
    cv: CVRecommendationInput
    jobs: List[JobInput]

class JobRecommendation(BaseModel):
    job_id: Any = None
    match_score: Any = 0.0
    reason: Any = ""

class RecommendationResponse(BaseModel):
    recommendations: List[Any] = []

# Git update: Triggering change for push
