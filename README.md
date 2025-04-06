# AI Model Benchmarking Tool

A lightweight FastAPI web backend for benchmarking AI models. The system allows users to upload pre-trained models, runs inference on them using dummy datasets, and generates a PDF report with performance metrics.

## Features

- Support for multiple model formats (.pt, .h5, .onnx, .tflite, .pkl)
- Performance metrics calculation (accuracy, inference time, memory usage)
- PDF report generation with visualizations
- Simple REST API for model upload and benchmarking
## Setup

1. Clone the repository
2. Install the dependencies:

bash
pip install -r requirements.txt


3. Run the application:

bash
uvicorn main:app --reload


The application will be available at [https://ml-analyzer.vercel.app/]

## API Endpoints

- POST /upload: Upload a model file
- POST /benchmark/{session_id}: Benchmark the uploaded model
- GET /report/{session_id}: Get the generated PDF report

## Project Structure

- main.py: FastAPI application entry point
- config.py: Configuration settings
- routes.py: API route handlers
- utils/model_loader.py: Model loading utilities
- utils/benchmark.py: Benchmarking functionality
- utils/pdf_generator.py: PDF report generation
- tests/: Unit tests


## Supported Model Formats

- PyTorch models (.pt)
- TensorFlow/Keras models (.h5)
- ONNX models (.onnx)
- TensorFlow Lite models (.tflite)
- Scikit-learn models (.pkl)



![WhatsApp Image 2025-04-06 at 21 18 30_b17612db](https://github.com/user-attachments/assets/5e26579a-85f5-417d-963b-f75063d3e264)


![WhatsApp Image 2025-04-06 at 21 05 19_6e5339ad](https://github.com/user-attachments/assets/e059e8d4-b027-43c9-9635-eba2217dfee4)


![WhatsApp Image 2025-04-06 at 21 12 50_5b2b9e62](https://github.com/user-attachments/assets/489faca6-deec-42fd-81df-c6537333e2b8)


![WhatsApp Image 2025-04-06 at 21 22 01_2019411d](https://github.com/user-attachments/assets/1ba1fe12-f7d0-434a-a323-3b0a983e5452)


![WhatsApp Image 2025-04-06 at 21 22 02_983ddc11](https://github.com/user-attachments/assets/37816be4-995b-4b14-9b09-5ff32943870c)


![WhatsApp Image 2025-04-06 at 21 22 10_7e46a533](https://github.com/user-attachments/assets/41a095bf-936d-4486-b25b-f5b5139c791d)


[model-analysis-report-2025-04-06.pdf](https://github.com/user-attachments/files/19622289/model-analysis-report-2025-04-06.pdf)



## License


MIT
