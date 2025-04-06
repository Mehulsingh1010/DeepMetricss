//
//  ModelListView.swift
//  DeepMetrics
//
//  Created by Manmohan Shrivastava on 06/04/25.
//

import SwiftUI

struct ModelListView: View {
    let testModels = ["Model 1", "Model 2", "Model 3"]
    
    var body: some View {
        NavigationStack{
            VStack{
                HStack {
                  List {
                      ForEach(testModels, id: \.self) { item in
                          Text(item)
                      }
                  }.listStyle(.automatic)
                }.padding(.all)
                Spacer()
            }
            .navigationTitle("Models")
        }
    }
}

#Preview {
    ModelListView()
}
