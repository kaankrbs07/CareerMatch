# -*- coding: utf-8 -*-
"""
Basit anahtar kelime ve etiket skoru.
- TR/EN ortak teknoloji sözlüğü
- RapidFuzz parsiyel oranı ile esnek eşleşme
"""
from __future__ import annotations
from typing import Dict, List, Tuple
from rapidfuzz import fuzz, process
import re

TECH_LEXICON = [
    # -- Languages --
    "python", "java", "c#", "c++", "c", "javascript", "typescript", "go", "golang", "rust",
    "swift", "kotlin", "php", "ruby", "scala", "perl", "r", "dart", "lua", "shell", "bash",
    "powershell", "objective-c", "haskell", "elixir", "clojure", "groovy",

    # -- Frontend --
    "react", "angular", "vue", "vue.js", "svelte", "next.js", "nuxt", "ember", "backbone",
    "jquery", "html", "html5", "css", "css3", "sass", "scss", "less", "tailwind", "bootstrap",
    "material ui", "chakra ui", "ant design", "webpack", "vite", "babel", "npm", "yarn", "pnpm",
    "redux", "mobx", "context api", "rxjs",

    # -- Backend & Frameworks --
    "node.js", "nodejs", "express", "nestjs", "fastapi", "flask", "django", "spring", "spring boot",
    "hibernate", ".net", ".net core", "asp.net", "entity framework", "laravel", "symfony",
    "ruby on rails", "rails", "gin", "echo", "fiber", "actix", "rocket", "phoenix",

    # -- Mobile --
    "flutter", "react native", "ionic", "xamarin", "maui", "swiftui", "jetpack compose",
    "android", "ios", "cordova", "capacitor",

    # -- Data & AI --
    "pandas", "numpy", "scikit-learn", "sklearn", "tensorflow", "keras", "pytorch", "matplotlib",
    "seaborn", "nlp", "transformers", "huggingface", "opencv", "llm", "lanchain", "openai",
    "machine learning", "deep learning", "data science", "big data", "spark", "hadoop",
    "airflow", "kafka", "rabbitmq", "celery",

    # -- Databases --
    "sql", "mysql", "postgresql", "postgres", "sqlite", "oracle", "sql server", "mssql",
    "mongodb", "mongo", "cassandra", "redis", "elasticsearch", "neo4j", "dynamodb",
    "firebase", "firestore", "mariadb", "couchdb", "graphql",

    # -- DevOps & Cloud --
    "aws", "amazon web services", "azure", "gcp", "google cloud", "docker", "kubernetes", "k8s",
    "jenkins", "gitlab ci", "github actions", "circleci", "travis ci", "terraform", "ansible",
    "chef", "puppet", "linux", "unix", "ubuntu", "centos", "nginx", "apache", "serverless",
    "lambda", "ec2", "s3", "rds",

    # -- Tools & Practices --
    "git", "github", "gitlab", "bitbucket", "jira", "confluence", "trello", "asana", "slack",
    "agile", "scrum", "kanban", "tdd", "bdd", "ci/cd", "rest", "rest api", "soap", "grpc",
    "microservices", "monolith", "mvc", "mvvm", "clean architecture", "domain driven design",
    "solid", "design patterns", "oop", "functional programming",

    # -- Health & Medicine --
    "cardiology", "neurology", "pediatrics", "oncology", "radiology", "surgery", "nursing",
    "patient care", "emergency", "pharmacy", "medicine", "doctor", "nurse", "therapist",
    "psychology", "psychiatry", "dentistry", "nutrition", "dietetics", "hospital", "clinic",
    "medical records", "healthcare", "public health", "epidemiology", "biomedical",

    # -- Law & Legal --
    "litigation", "corporate law", "criminal law", "family law", "intellectual property",
    "contract", "contract law", "legal research", "legal writing", "paralegal", "attorney",
    "lawyer", "judge", "court", "compliance", "regulatory", "mergers", "acquisitions",
    "tax law", "immigration law", "property law", "employment law", "arbitration",

    # -- Real Estate & Construction --
    "real estate", "property management", "sales", "leasing", "appraisal", "brokerage",
    "construction", "architecture", "civil engineering", "urban planning", "interior design",
    "renovation", "contractor", "site management", "zoning", "land development", "mortgage",

    # -- Industry & Manufacturing --
    "manufacturing", "production", "quality control", "quality assurance", "logistics",
    "supply chain", "procurement", "maintenance", "assembly", "machining", "welding",
    "cnc", "automation", "robotics", "plc", "scada", "lean manufacturing", "six sigma",
    "kaizen", "safety", "osha", "industrial engineering", "mechanical engineering",

    # -- Textile & Fashion --
    "textile", "fashion design", "pattern making", "sewing", "weaving", "knitting",
    "dyeing", "printing", "garment", "apparel", "fabric", "fiber", "merchandising",
    "retail", "trend analysis", "visual merchandising", "embroidery", "tailoring",

    # -- Services & Hospitality --
    "customer service", "hospitality", "hotel", "restaurant", "catering", "tourism",
    "housekeeping", "cleaning", "sanitization", "janitorial", "receptionist", "admin",
    "assistant", "data entry", "sales representative", "marketing", "advertising", "pr",
    "event planning", "culinary", "chef", "bartender", "waiter", "barista"
]
def extract_tags(text: str, threshold: int = 85) -> list[str]:
    t = (text or "").lower()
    tags = set()
    
    for term in TECH_LEXICON:
        term_l = term.lower()
        if term_l in t:
            tags.add(term_l)
            continue
        if fuzz.partial_ratio(term_l, t) >= threshold:
            tags.add(term_l)

    return sorted(tags)

def tag_bonus(query_tags, job_tags) -> float:
    if not query_tags or not job_tags:
        return 0.0

    qs = {t.strip().lower() for t in query_tags if t and t.strip()}
    js = {t.strip().lower() for t in job_tags if t and t.strip()}
    inter = qs & js
    if not inter:
        return 0.0
    return len(inter) / len(qs | js)