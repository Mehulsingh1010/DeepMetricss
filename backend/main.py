from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from model_handler import load_model
from benchmark import benchmark_model
from pdf_report import generate_pdf
import shutil
import os

app = FastAPI()

# CORS settings for local frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model_path= "temp_model/"
REPORT_PATH = "report.pdf"

os.makedirs(model_path, exist_ok=True)
model_file_path = None
model_object = None

@app.post("/upload_model")
def upload_model(file: UploadFile = File(...)):
    global model_file_path, model_object
    ext = os.path.splitext(file.filename)[-1]
    if ext not in [".pt",".h5",".onnx",".tflite",".pkl"]:
        raise HTTPException(status_code=400, detail="Unsupported model format")

    model_file_path = os.path.join(model_path, file.filename)
    with open(model_file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    model_object = load_model(model_file_path)
    return {"status": "Model uploaded successfully"}

@app.post("/run_benchmark")
def run_benchmark_endpoint():
    if not model_object or not model_path:
        raise HTTPException(status_code=400, detail="No model loaded")

    metrics = benchmark_model(model_object, model_path)
    print("\n===== Benchmark Results =====")
    for k, v in metrics.items():
        print(f"{k}: {v}")
    print("============================\n")
    return metrics

@app.get("/download_report")
def download_report():
    if not os.path.exists(REPORT_PATH):
        raise HTTPException(status_code=404, detail="Report not found")
    return FileResponse(REPORT_PATH, media_type="application/pdf", filename="benchmark_report.pdf")

@app.post("/generate_report")
def create_report(y_true: str = Form(...), y_pred: str = Form(...)):
    y_true = list(map(int, y_true.split(",")))
    y_pred = list(map(int, y_pred.split(",")))
    metrics = benchmark_model(model_object, model_path)
    generate_pdf(metrics, REPORT_PATH)
    return {"status": "PDF report generated successfully"}


if __name__ == "_main_":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
