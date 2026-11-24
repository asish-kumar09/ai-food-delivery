import pandas as pd
import joblib
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score,mean_absolute_error,mean_squared_error,root_mean_squared_error
from difflib import get_close_matches
import numpy as np
from pathlib import Path

base_dir=Path(__file__).resolve().parent.parent
model_path=base_dir/"similar_product"
df=pd.read_csv("similar_product.csv")
#strip
df["food_name"]=df["food_name"].str.strip()
df["description"]=df["description"].str.strip()
df["category"]=df["category"].str.strip()
df["ingredients"]=df["ingredients"].str.strip()
df["food_type"]=df["food_type"].str.strip()
print("strip completed")
#lower
df["food_name"]=df["food_name"].str.lower()
df["description"]=df["description"].str.lower()
df["category"]=df["category"].str.lower()
df["ingredients"]=df["ingredients"].str.lower()
df["food_type"]=df["food_type"].str.lower()
print("lower completed")
# missing
df["food_name"] = df["food_name"].fillna("Unknown")
df["description"] = df["description"].fillna("Unknown")
df["category"] = df["category"].fillna("Unknown")
df["ingredients"] = df["ingredients"].fillna("Unknown")
df["food_type"] = df["food_type"].fillna("Unknown")
print("missing completed")
#correction
valid_category=["veg","non-veg"]
valid_food_type=["snacks","starters","burger",
                "rolls","sandwich","pizza","main course","biryani",
                "indian bread","desserts","ice cream","beverages",
                "pastry","cakes","breakfast","chocolates"]
def correct_food_type(value):
    if pd.isna(value):
        return value
    match=get_close_matches(value,valid_food_type,n=1,cutoff=0.7)
    return match[0] if match else value
df["food_type"]=df["food_type"].apply(correct_food_type)
def correct_category(value):
    if pd.isna(value):
        return value
    match=get_close_matches(value,valid_category,n=1,cutoff=0.7)
    return match[0] if match else value
df["category"]=df["category"].apply(correct_category)
df.to_csv("cleaned_dataset.csv", index=False)


df["features"] = (
    df["food_name"] + " " + df["description"] + " " + df["category"] +" " + df["ingredients"] +" "+ df["food_type"]
)

print("Combined Features")
print(df["features"].head())
vectorizer = TfidfVectorizer(stop_words="english")

tfidf_matrix = vectorizer.fit_transform(df["features"])

print("TF-IDF Matrix Shape")
print(tfidf_matrix.shape)
similarity_matrix = cosine_similarity(tfidf_matrix)

print("Similarity Matrix Shape")
print(similarity_matrix.shape)

joblib.dump(vectorizer, model_path / "tfidf_vectorizer.pkl")
joblib.dump(similarity_matrix, model_path / "similarity_matrix.pkl")
joblib.dump(
    df[["food_name", "description", "category", "ingredients", "food_type"]],
    model_path / "food_data.pkl"
)
print("Model saved successfully")