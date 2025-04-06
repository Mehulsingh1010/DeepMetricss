//
//  MLAnalyserView.swift
//  DeepMetrics
//
//  Created by Manmohan Shrivastava on 06/04/25.
//

import SwiftUI
import WebKit

struct MLAnalyzerView: View {
    @State private var isLoading = true

    var body: some View {
        ZStack {
            WebView(url: URL(string: "https://ml-analyzer.vercel.app/dashboard")!, isLoading: $isLoading)
                .edgesIgnoringSafeArea(.all)

            if isLoading {
                ProgressView("Loading...")
                    .progressViewStyle(CircularProgressViewStyle())
                    .padding()
                    .background(Color(.systemBackground).opacity(0.8))
                    .cornerRadius(10)
            }
        }
    }
}

#Preview {
    MLAnalyzerView()
}


struct WebView: UIViewRepresentable {
    let url: URL
    @Binding var isLoading: Bool

    func makeUIView(context: Context) -> WKWebView {
        let webView = WKWebView()
        webView.navigationDelegate = context.coordinator
        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {
        let request = URLRequest(url: url)
        webView.load(request)
    }

    func makeCoordinator() -> Coordinator {
        Coordinator(isLoading: $isLoading)
    }

    class Coordinator: NSObject, WKNavigationDelegate {
        @Binding var isLoading: Bool

        init(isLoading: Binding<Bool>) {
            _isLoading = isLoading
        }

        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            isLoading = false
        }
    }
}
