import pandas as pd
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import r2_score,mean_absolute_error,mean_squared_error,root_mean_squared_error
from difflib import get_close_matches
import numpy as np
from pathlib import Path

base_dir=Path(__file__).resolve().parent.parent
model_path=base_dir/"dist_fee"
df=pd.read_csv("dist_fee.csv")
#strip
df["festival"]=df["festival"].str.strip()
df["membership"]=df["membership"].str.strip()
print("weather completed")
#lower
df["festival"]=df["festival"].str.lower()
df["membership"]=df["membership"].str.lower()
print("lower completed")

#missing
df["distance_km"] = pd.to_numeric(df["distance_km"], errors="coerce")
df["order_items"] = pd.to_numeric(df["order_items"], errors="coerce")
df["dist_fee"] = pd.to_numeric(df["dist_fee"], errors="coerce")

df["distance_km"] = df["distance_km"].fillna(df["distance_km"].median())
df["order_items"] = df["order_items"].fillna(df["order_items"].median())
df["dist_fee"] = df["dist_fee"].fillna(df["dist_fee"].median())

df["festival"] = df["festival"].fillna("normal")
df["membership"] = df["membership"].fillna("none")
print("missing completed")
#correction
valid_festivals=["normal","new_year","makar_sankranti","holi","ugadi","ram_navami",
"akshaya_tritiya","rath_yatra","independence_day","ganesh_chaturthi","onam",
"dussehra","diwali","christmas"]
valid_membership=["none","weekly","monthly","yearly"]
def correct_festivals(value):
    if pd.isna(value):
        return value
    match=get_close_matches(value,valid_festivals,n=1,cutoff=0.7)
    return match[0] if match else value
df["festival"]=df["festival"].apply(correct_festivals)
def correct_membership(value):
    if pd.isna(value):
        return value
    match=get_close_matches(value,valid_membership,n=1,cutoff=0.7)
    return match[0] if match else value
df["membership"]=df["membership"].apply(correct_membership)
print("missing completed")

#unrealstic values
invalid = (df["distance_km"] <= 0) | (df["distance_km"] >= 15)
df.loc[invalid, "distance_km"] = np.random.uniform(0, 15, size=invalid.sum())
df["distance_km"] = df["distance_km"].round(1)
invalid1 = (df["order_items"] <1) | (df["order_items"] >20)
df.loc[invalid1, "order_items"] = np.random.uniform(1,20, size=invalid1.sum())
df["order_items"] = df["order_items"].round(1)
invalid2 = (df["dist_fee"] <=0) | (df["dist_fee"] >45)
df.loc[invalid2, "dist_fee"] = np.random.uniform(0,45, size=invalid2.sum())
df["dist_fee"] = df["dist_fee"].round(1)
#handled cid
df = df.drop_duplicates(subset="cid", keep="first")
df = df.reset_index(drop=True)
df["cid"] = range(1, len(df) + 1)
print("cid handled")
#duplicate rows
print("duplicate rows:",df.duplicated().sum())
df=df.drop_duplicates()
print("duplicate rows after cleaning:",df.duplicated().sum())

#final category check
df.loc[~df["festival"].isin(valid_festivals),"festival"]="normal"
df.loc[~df["membership"].isin(valid_membership),"membership"]="none"
print("category validation completed")

#final invalid value check
print("invalid distance:",((df["distance_km"]<=0)|(df["distance_km"]>=15)).sum())
print("invalid order items:",((df["order_items"]<1)|(df["order_items"]>20)).sum())
print("invalid dist fee:",((df["dist_fee"]<0)|(df["dist_fee"]>45)).sum())

#round values
df["distance_km"]=df["distance_km"].round(1)
df["order_items"]=df["order_items"].round().astype(int)
df["dist_fee"]=df["dist_fee"].round(1)

print("cleaning completed")

#final dataset information
print("\nFinal shape:")
print(df.shape)
print("\nFinal columns:")
print(df.columns)
print("\nFinal sample:")
print(df.head())
print("\nFinal statistics:")
print(df.describe())

cleaned_path=base_dir/"dist_fee"/"dist_fee_cleaned.csv"
os.makedirs(cleaned_path.parent,exist_ok=True)
df.to_csv(cleaned_path,index=False)
print("\nCleaned dataset saved:")
print(cleaned_path)

df=df.drop("cid",axis=1)
X=df.drop("dist_fee",axis=1)
y=df["dist_fee"]

festival=LabelEncoder()
membership=LabelEncoder()

X_train,X_test,y_train,y_test=train_test_split(X,y,test_size=0.20,random_state=42)

X_train["festival"]=festival.fit_transform(X_train["festival"])
X_test["festival"]=festival.transform(X_test["festival"])
X_train["membership"]=membership.fit_transform(X_train["membership"])
X_test["membership"]=membership.transform(X_test["membership"])

model=RandomForestRegressor(n_estimators=300,max_depth=10,random_state=42)
model.fit(X_train,y_train)

predicted_time=model.predict(X_test)
mae = mean_absolute_error(y_test, predicted_time)
mse = mean_squared_error(y_test, predicted_time)
rmse = np.sqrt(mse)
r2 = r2_score(y_test, predicted_time)
print(f"Mean Absolute Error (MAE): {mae:.2f} fee")
print(f"Mean Squared Error (MSE): {mse:.2f}")
print(f"Root Mean Squared Error (RMSE): {rmse:.2f} fee")
print(f"Test R² Score: {r2 * 100:.2f}%")
train_predicted_fee = model.predict(X_train)
train_r2 = r2_score(y_train, train_predicted_fee)
print(f"Train R² Score: {train_r2 * 100:.2f}%")
joblib.dump(model,model_path/"fee.pkl")
joblib.dump(festival,model_path/"festivals.pkl")
joblib.dump(membership,model_path/"membership.pkl")

