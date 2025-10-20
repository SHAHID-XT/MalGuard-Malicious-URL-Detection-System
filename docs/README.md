# MalGuard: Malicious URL Detection System — Updated README.md

MalGuard is a state-of-the-art cybersecurity project designed to detect and block malicious URLs in real-time through a combination of advanced machine learning models and a browser extension. This repository contains everything from data processing, model training, and evaluation to deployment-ready APIs and browser-based protection.

***

## Table of Contents

- [Project Description](#project-description)  
- [Repository Structure](#repository-structure)  
- [Machine Learning Model & Training](#machine-learning-model--training)  
- [Data Exploration & Visualization](#data-exploration--visualization)  
- [Browser Extension](#browser-extension)  
- [Getting Started](#getting-started)  
- [Logging & Monitoring](#logging--monitoring)  
- [Contributing & Future Work](#contributing--future-work)  

***

## Project Description

MalGuard empowers users and enterprises to preemptively identify, classify, and block URLs involved in phishing, malware, and defacement attacks. The system leverages an ensemble of machine learning classifiers trained on a large amalgamated dataset gathered from multiple high-quality Kaggle sources, refined through thorough feature engineering and cross-validation. A Chrome extension adds seamless, in-browser real-time browsing safety.

***

## Repository Structure

```plaintext
.gitignore
main.py                    # Flask REST API server for classification
README.md                  # This README
requirements.txt           # Python dependencies

docs/                      # Documentation and supplementary README
  README.md

extension/                 # Browser extension project
  background.js            # Background script handling navigation and blocking
  logo.jpg                 # Logo and icons
  manifest.json            # Extension manifest
  public/
    blocked.html           # Warning page HTML
    blocked.css            # Warning page CSS
    blocked.js             # Warning page JS
    popup.html             # Popup UI for user controls
    popup.css              # Popup styling
    popup.js               # Popup logic, history, whitelist management

logs/
  url_classification.log   # API runtime logs

models/
  malicious_url_model.pkl  # Trained ML model
  vectorizer.pkl           # TF-IDF vectorizer for URLs

notebooks/
  malicious-urls-classification.ipynb  # Notebook with full training pipeline
```

***

## Machine Learning Model & Training

- Trained using ensemble classifiers (RandomForest) balanced with TF-IDF feature extraction and lexical URL features.
- Aggregates and cleans multiple Kaggle datasets (10+ large public datasets).
- Binary label system: `0` for benign URLs and `1` for malicious URLs.
- Notebook provides extensive data cleaning, feature engineering, and evaluation with stratified cross-validation nearing 95.6%+ accuracy.
- Exported artifacts (`.pkl`) integrated into Flask API allowing real-time prediction.

***

## Data Exploration & Visualization

The notebook includes rich data visualization for understanding dataset characteristics:

- **Label Distribution:** Counts of benign and malicious URLs.
- **URL Length Analysis:** Histograms and boxplots showing length spread.
- **TLD & Domain Frequencies:** Bar charts of top domain extensions and hosts.
- **Entropy Measures:** URL entropy distribution as a randomness proxy.
- **Path & Query Word Frequency:** Insights into common URL parameter terms.
- **Malicious Percentage Pie Chart:** Visual split of benign vs malicious dataset.
- **Sample URL Previews:** Random examples from each class for qualitative understanding.

These insights help assess dataset quality, distribution biases, and feature importance before model training.

***

## Browser Extension

- Implements proactive URL blocking and warning using the trained ML model.
- Users manage protection settings, view block history, and whitelist safe domains.
- Lightweight, secure Chrome manifest v3 extension with clean UI and full UTF-8 support.
- Background script intercepts navigation events to query the Flask classification API.

***

## Getting Started

1. Clone repository and create a virtual environment.
2. Install dependencies:  
   `pip install -r requirements.txt`
3. Launch API server:  
   `python main.py`
4. Load browser extension (folder `/extension`) as unpacked extension in Chrome.
5. Start browsing with MalGuard protection activated!

***

## Logging & Monitoring

All classification requests and results are logged to `logs/url_classification.log`, facilitating audit trails, performance tracking, and debugging.

***

## Contributing & Future Work

- Incorporate real-time threat intelligence updates.
- Add AI explainability features for URL assessment.
- Expand dataset to cover emerging phishing/malware vectors.
- Optimize extension performance and add multi-browser support.
- Contributions welcome for code, datasets, UI, and documentation.

