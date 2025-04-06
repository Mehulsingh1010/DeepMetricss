//
//  ModelDetailsView.swift
//  DeepMetrics
//
//  Created by Manmohan Shrivastava on 06/04/25.
//

import SwiftUI

struct ModelDetailsView: View {
    @State private var selectedTab = 0
    @State private var selectedCategory = "General"
  
    let categories = ["Analyse", "Compare", "Reports", "Chatbot"]
   

    var body: some View {
        NavigationView {
            VStack(alignment: .leading, spacing: 16) {
               
              

                ScrollView(.horizontal, showsIndicators: false) {
                    HStack {
                        ForEach(categories, id: \.self) { category in
                            Button(action: {
                                selectedCategory = category
                            }) {
                                Text(category)
                                    .padding(.horizontal, 12)
                                    .padding(.vertical, 8)
                                    .background(selectedCategory == category ? Color.blue.opacity(0.2) : Color.clear)
                                    .cornerRadius(20)
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 20)
                                            .stroke(Color.blue.opacity(0.5), lineWidth: 1)
                                    )
                            }
                            .foregroundColor(selectedCategory == category ? .blue : .primary)
                        }
                    }
                    .padding(.horizontal)
                }

                HStack {
                    Image(systemName: "magnifyingglass")
                        .foregroundColor(.gray)
                    TextField("Search", text: .constant(""))
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(12)
                .padding(.horizontal)

               
                Spacer()
            }
            .toolbar {
                ToolbarItem(placement: .principal) {
                    Text("Model Name")
                        .font(.system(size: 24, weight: .bold))
                }
                ToolbarItem(placement: .topBarLeading){
                    
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .padding(.top)
        }
    }
}

#Preview {
    ModelDetailsView()
}
