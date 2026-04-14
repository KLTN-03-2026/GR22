from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
import shutil
import os
from parser import process_cv, get_job_recommendations_v2
from models import CVData, CVRecommendationInput, RecommendationRequest, RecommendationResponse

app = FastAPI(title="CV Extraction API")

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    error_details = exc.errors()
    print(f"[VALIDATION ERROR] {error_details}")
    return JSONResponse(
        status_code=422,
        content={"detail": error_details, "message": "Validation Error. Check Python logs."}
    )

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/extract-cv", response_model=CVData)
async def extract_cv(file: UploadFile = File(...)):
    """Upload a CV PDF and return structured JSON."""
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        cv_data = process_cv(file_path)
        return cv_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)

@app.post("/recommend-jobs", response_model=RecommendationResponse)
async def recommend_jobs(request: RecommendationRequest):
    try:
        # Pydantic models to dict for the parser logic
        cv_dict = request.cv.model_dump()
        jobs_list = [j.model_dump() for j in request.jobs]
        
        # Use V2 (Traditional Algorithm)
        results = get_job_recommendations_v2(cv_dict, jobs_list)
        return results
    except Exception as e:
        print(f"[ERROR] Recommendation endpoint failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
