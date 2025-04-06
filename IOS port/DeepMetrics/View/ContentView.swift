//
//  ContentView.swift
//  DeepMetrics
//
//  Created by Manmohan Shrivastava on 06/04/25.
//

import SwiftUI

struct ContentView: View {
    var body: some View {
        NavigationStack{
            
            ZStack{
                
                ZStack {
                    Color.black.ignoresSafeArea()

                    LinearGradient(
                        gradient: Gradient(colors: [Color.black.opacity(0.6), Color.blue.opacity(0.1)]),
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                    .blendMode(.screen)
                    .ignoresSafeArea()

                    RadialGradient(
                        gradient: Gradient(colors: [Color.pink.opacity(0.1), Color.clear]),
                        center: .bottomTrailing,
                        startRadius: 100,
                        endRadius: 300
                    )
                    .blendMode(.screen)
                    .ignoresSafeArea()
                }
                
                VStack{
                    
                    Image(systemName: "sparkles")
                        .resizable()
                        .scaledToFit()
                        .frame(width: 50, height: 50)
                        .foregroundColor(.purple)

                    Text("Deep Metrics")
                        .font(.largeTitle)
                        .fontWeight(.bold)
                        .foregroundStyle(LinearGradient(colors: [.purple, .blue], startPoint: .leading, endPoint: .trailing))
                        .padding(.bottom)

                    Text("Upload your models, analyze with Gemini AI, and discover insights from your data")
                        .font(.body)
                        .fontWeight(.semibold)
                        .foregroundColor(.white)
                        .multilineTextAlignment(.center)
                        .padding(.bottom, 30)
                        .padding(.horizontal)

                    HStack(spacing: 20) {
                        VStack {
                            Image(systemName: "square.and.arrow.up")
                                .font(.title)
                                .foregroundColor(.purple)
                                .padding(.bottom)
                            
                            
                            Text("Upload Model")
                                .font(.headline)
                                .fontWeight(.semibold)
                                .foregroundColor(.white)
                          
                        }
                        .padding()
                        .background(Color.black.opacity(0.2))
                        .cornerRadius(10)

                        VStack {
                            Image(systemName: "doc.text")
                                .font(.title)
                                .foregroundColor(.blue)
                                .padding(.bottom)
                            
                            Text("Upload Dataset")
                                .font(.headline)
                                .fontWeight(.semibold)
                                .foregroundColor(.white)
                          
                        }
                        .padding()
                        .background(Color.black.opacity(0.2))
                        .cornerRadius(10)

                        VStack {
                            Image(systemName: "tray.and.arrow.down.fill")
                                .font(.title)
                                .foregroundColor(.pink)
                                .padding(.bottom)
                            
                            Text("Generate Data")
                                .font(.headline)
                                .fontWeight(.semibold)
                                .foregroundColor(.white)
                          
                        }
                        .padding()
                        .background(Color.black.opacity(0.2))
                        .cornerRadius(10)
                    }
                    .padding(.horizontal)
                    
                    
                    NavigationLink {
                        MLAnalyzerView()
                    } label: {
                        Text("Get Started")
                            .foregroundColor(.white)
                            .fontWeight(.semibold)
                            .padding()
                            .frame(maxWidth: .infinity)
                            .background(LinearGradient(gradient: Gradient(colors: [Color.purple, Color.blue]), startPoint: .leading, endPoint: .trailing))
                            .cornerRadius(30)
                            .padding(.horizontal, 60)
                            .padding(.top, 30)
                    }


                 
                    
                    Spacer()
                    
                }.padding(.all)
                
            }
           
        }
    }
}

#Preview {
    ContentView()
}
