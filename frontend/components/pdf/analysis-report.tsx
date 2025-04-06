import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer"

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 30,
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
    color: "#6200EA",
    fontWeight: "bold",
  },
  subheader: {
    fontSize: 18,
    marginBottom: 10,
    color: "#6200EA",
    fontWeight: "bold",
  },
  text: {
    fontSize: 12,
    marginBottom: 10,
    lineHeight: 1.5,
  },
  table: {
    display: "flex",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#DDDDDD",
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#F0F0F0",
  },
  tableCol: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#DDDDDD",
    padding: 5,
  },
  tableHeader: {
    fontSize: 12,
    fontWeight: "bold",
  },
  tableCell: {
    fontSize: 10,
    padding: 5,
  },
  image: {
    width: "100%",
    height: 200,
    marginVertical: 10,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: "center",
    fontSize: 10,
    color: "#666666",
  },
  pageNumber: {
    position: "absolute",
    bottom: 30,
    right: 30,
    fontSize: 10,
    color: "#666666",
  },
  recommendations: {
    backgroundColor: "#F0F0F0",
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#6200EA",
  },
  recommendationText: {
    fontSize: 12,
    lineHeight: 1.5,
  },
})

interface AnalysisReportProps {
  data: any
  options: {
    includeMetrics: boolean
    includeCharts: boolean
    includeComparison: boolean
    includePredictions: boolean
    includeRecommendations: boolean
  }
}

export const AnalysisReport = ({ data, options }: AnalysisReportProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>ML Model Analysis Report</Text>

      <View style={styles.section}>
        <Text style={styles.subheader}>Executive Summary</Text>
        <Text style={styles.text}>
          This report provides a comprehensive analysis of the machine learning model(s) evaluated using the ML Model
          Analyzer platform. The analysis includes performance metrics, strengths and weaknesses, and recommendations
          for improvement.
        </Text>

        <Text style={styles.text}>
          Report generated on: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
        </Text>
      </View>

      {options.includeMetrics && (
        <View style={styles.section}>
          <Text style={styles.subheader}>Performance Metrics</Text>
          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              <View style={styles.tableCol}>
                <Text style={styles.tableHeader}>Model</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableHeader}>Accuracy</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableHeader}>Precision</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableHeader}>Recall</Text>
              </View>
            </View>

            {(data?.models || []).map((model: any, index: number) => (
              <View key={index} style={styles.tableRow}>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{model.name}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{model.metrics?.accuracy || "N/A"}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{model.metrics?.precision || "N/A"}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{model.metrics?.recall || "N/A"}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {options.includeCharts && data?.charts && (
        <View style={styles.section}>
          <Text style={styles.subheader}>Performance Visualizations</Text>
          <Text style={styles.text}>
            The following charts visualize the performance metrics of the analyzed model(s).
          </Text>

          {data.charts.map((chart: any, index: number) => (
            <View key={index}>
              <Text style={styles.text}>{chart.title}</Text>
              <Image style={styles.image} src={chart.imageUrl || "/placeholder.svg"} />
            </View>
          ))}
        </View>
      )}

      {options.includePredictions && data?.predictions && (
        <View style={styles.section}>
          <Text style={styles.subheader}>Sample Predictions</Text>
          <Text style={styles.text}>Below are sample predictions made by the model on test data.</Text>

          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              <View style={styles.tableCol}>
                <Text style={styles.tableHeader}>Input</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableHeader}>Prediction</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableHeader}>Confidence</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableHeader}>Actual</Text>
              </View>
            </View>

            {data.predictions.map((pred: any, index: number) => (
              <View key={index} style={styles.tableRow}>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{pred.input}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{pred.prediction}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{pred.confidence}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{pred.actual || "N/A"}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {options.includeRecommendations && data?.recommendations && (
        <View style={styles.section}>
          <Text style={styles.subheader}>AI Recommendations</Text>

          {data.recommendations.map((rec: any, index: number) => (
            <View key={index} style={styles.recommendations}>
              <Text style={styles.recommendationTitle}>{rec.title}</Text>
              <Text style={styles.recommendationText}>{rec.description}</Text>
            </View>
          ))}
        </View>
      )}

      <Text style={styles.footer}>Generated by ML Model Analyzer - Powered by Gemini AI</Text>

      <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
    </Page>
  </Document>
)

