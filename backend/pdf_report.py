from fpdf import FPDF

def generate_pdf(results: dict, path: str):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    pdf.cell(200, 10, txt="Model Benchmark Report", ln=True, align='C')

    for metric, value in results.items():
        pdf.cell(200, 10, txt=f"{metric.capitalize()}: {value:.4f}", ln=True)

    pdf.output(path)