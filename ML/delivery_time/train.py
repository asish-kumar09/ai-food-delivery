print("TRAIN.PY STARTED")
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
model_path=base_dir/"delivery_time"
df=pd.read_csv("delivery_time.csv")
print(df.isnull().sum())
print(df.isnull().sum().sum())
print(df.duplicated().sum())
#strip
df["weather"]=df["weather"].str.strip()
df["weekend"]=df["weekend"].str.strip()
df["month"]=df["month"].str.strip()
df["traffic"]=df["traffic"].str.strip()
df["festival"]=df["festival"].str.strip()
print("strip completed")
#lower
df["weather"]=df["weather"].str.lower()
df["weekend"]=df["weekend"].str.lower()
df["month"]=df["month"].str.lower()
df["traffic"]=df["traffic"].str.lower()
df["festival"]=df["festival"].str.lower()
print("lower completed")
#missing 


df["distance_km"] = pd.to_numeric(df["distance_km"], errors="coerce")
df["order_items"] = pd.to_numeric(df["order_items"], errors="coerce")
df["rider_rating"] = pd.to_numeric(df["rider_rating"], errors="coerce")
df["restaurant_order_queue"] = pd.to_numeric(df["restaurant_order_queue"], errors="coerce")
df["delivery_time_mins"] = pd.to_numeric(df["delivery_time_mins"], errors="coerce")
df["distance_km"] = df["distance_km"].fillna(df["distance_km"].median())
df["order_items"] = df["order_items"].fillna(df["order_items"].median())
df["rider_rating"] = df["rider_rating"].fillna(df["rider_rating"].median())
df["restaurant_order_queue"] = df["restaurant_order_queue"].fillna(df["restaurant_order_queue"].median())
df["delivery_time_mins"] = df["delivery_time_mins"].fillna(df["delivery_time_mins"].median())
df["weather"] = df["weather"].fillna("normal")
df["weekend"] = df["weekend"].fillna("non_weekend")
df["order_time"] = df["order_time"].fillna("12:00")
df["festival"] = df["festival"].fillna("normal")
df["month"] = df["month"].fillna("may")
df["traffic"] = df["traffic"].fillna("normal")
print("missing completed")
#correction
valid_months = [
    "january", "february", "march", "april","may", "june", "july", "august",
    "september", "october", "november", "december"]
valid_traffics=["normal","medium","high","veryhigh"]
valid_weekend=["weekend","non_weekend"]
valid_weather=["normal","cloudy","fog","rain","wind"]
valid_festivals=["normal","new_year","makar_sankranti","holi","ugadi","ram_navami",
"akshaya_tritiya","rath_yatra","independence_day","ganesh_chaturthi","onam",
"dussehra","diwali","christmas"]
def correct_traffic(value):
    if pd.isna(value):
        return value
    match=get_close_matches(value,valid_traffics,n=1,cutoff=0.6)
    return match[0] if match else value
df["traffic"]=df["traffic"].apply(correct_traffic)
def correct_weekend(value):
    if pd.isna(value):
        return value
    match=get_close_matches(value,valid_weekend,n=1,cutoff=0.6)
    return match[0] if match else value
df["weekend"]=df["weekend"].apply(correct_weekend)
def correct_weather(value):
    if pd.isna(value):
        return value
    match=get_close_matches(value,valid_weather,n=1,cutoff=0.6)
    return match[0] if match else value
df["weather"]=df["weather"].apply(correct_weather)
def correct_festivals(value):
    if pd.isna(value):
        return value
    match=get_close_matches(value,valid_festivals,n=1,cutoff=0.8)
    return match[0] if match else value
df["festival"]=df["festival"].apply(correct_festivals)
def correct_month(value):
    if pd.isna(value):
        return value
    match = get_close_matches(
        value,valid_months, n=1,cutoff=0.6)
    return match[0] if match else value
df["month"] = df["month"].apply(correct_month)
print("correction completed")
#unrealstic values
invalid = (df["distance_km"] <= 0) | (df["distance_km"] >= 15)
df.loc[invalid, "distance_km"] = np.random.uniform(0, 15, size=invalid.sum())
df["distance_km"] = df["distance_km"].round(1)

invalid1 = (df["rider_rating"] <1) | (df["rider_rating"] > 5)
df.loc[invalid1, "rider_rating"] = np.random.uniform(1,5, size=invalid1.sum())
df["rider_rating"] = df["rider_rating"].round(1)
invalid2= (df["order_items"] <1) | (df["order_items"] > 20)
df.loc[invalid2, "order_items"] = np.random.uniform(1,20, size=invalid2.sum())
df["order_items"] = df["order_items"].round(1)
invalid3= (df["restaurant_order_queue"] <1) | (df["restaurant_order_queue"] > 40)
df.loc[invalid3, "restaurant_order_queue"] = np.random.uniform(1,40, size=invalid3.sum())
df["restaurant_order_queue"] = df["restaurant_order_queue"].round(1)
invalid4 = ((df["delivery_time_mins"] < 5) |(df["delivery_time_mins"] > 30))
df.loc[invalid4, "delivery_time_mins"] = np.nan
df["delivery_time_mins"] = df["delivery_time_mins"].fillna(
    df["delivery_time_mins"].median())
print("unrealstic completed")
# outliers
Q1 = df["delivery_time_mins"].quantile(0.25)
Q3 = df["delivery_time_mins"].quantile(0.75)
IQR = Q3 - Q1
lower = Q1 - 1.5 * IQR
upper = Q3 + 1.5 * IQR
outliers = (
    (df["delivery_time_mins"] < lower) |
    (df["delivery_time_mins"] > upper)
)
print("Number of outliers before handling:", outliers.sum())
print(df.loc[outliers, "delivery_time_mins"])
df["delivery_time_mins"] = df["delivery_time_mins"].clip(
    lower=lower,
    upper=upper
)
df["delivery_time_mins"] = df["delivery_time_mins"].clip(
    lower=5,
    upper=30
)
print("Number of outliers after handling:",
      ((df["delivery_time_mins"] < lower) |
       (df["delivery_time_mins"] > upper)).sum())
print("outliers completed")
# invalid weather

winter = ["december", "january", "february"]
summer = ["march", "april", "may"]
monsoon = ["june", "july", "august", "september"]
autumn = ["october", "november"]
weather_by_season = {
    "winter": ["normal", "fog", "cloudy", "wind"],
    "summer": ["normal", "cloudy", "wind"],
    "monsoon": ["normal", "rain", "cloudy", "wind"],
    "autumn": ["normal", "cloudy", "wind"]
}
def get_season(month):
    if month in winter:
        return "winter"
    elif month in summer:
        return "summer"
    elif month in monsoon:
        return "monsoon"
    elif month in autumn:
        return "autumn"
df["season"] = df["month"].apply(get_season)
invalid_weather = ~df.apply(
    lambda row: row["weather"] in weather_by_season[row["season"]],axis=1)
df.loc[invalid_weather, "weather"] = "normal"
df.drop("season", axis=1, inplace=True)
print("invalid completed")
df["order_time"] = pd.to_datetime(df["order_time"], format="%H:%M")
df["order_hour"] = df["order_time"].dt.hour
df["order_minute"] = df["order_time"].dt.minute
df.drop("order_time", axis=1, inplace=True)

df.to_csv("cleaned_dataset.csv", index=False)



df=df.drop("cid",axis=1)
X=df.drop("delivery_time_mins",axis=1)
y=df["delivery_time_mins"]

weekend=LabelEncoder()
month=LabelEncoder()
traffic=LabelEncoder()
weather=LabelEncoder()
festival=LabelEncoder()
X_train,X_test,y_train,y_test=train_test_split(X,y,test_size=0.20,random_state=42)

X_train["weekend"]=weekend.fit_transform(X_train["weekend"])
X_test["weekend"]=weekend.transform(X_test["weekend"])
X_train["month"]=month.fit_transform(X_train["month"])
X_test["month"]=month.transform(X_test["month"])
X_train["traffic"]=traffic.fit_transform(X_train["traffic"])
X_test["traffic"]=traffic.transform(X_test["traffic"])
X_train["weather"]=weather.fit_transform(X_train["weather"])
X_test["weather"]=weather.transform(X_test["weather"])
X_train["festival"]=festival.fit_transform(X_train["festival"])
X_test["festival"]=festival.transform(X_test["festival"])

model=RandomForestRegressor(n_estimators=300,max_depth=10,random_state=42)
model.fit(X_train,y_train)

predicted_time=model.predict(X_test)
mae = mean_absolute_error(y_test, predicted_time)
mse = mean_squared_error(y_test, predicted_time)
rmse = np.sqrt(mse)
r2 = r2_score(y_test, predicted_time)
print(f"Mean Absolute Error (MAE): {mae:.2f} mins")
print(f"Mean Squared Error (MSE): {mse:.2f}")
print(f"Root Mean Squared Error (RMSE): {rmse:.2f} mins")
print(f"Test R² Score: {r2 * 100:.2f}%")
train_predicted_time = model.predict(X_train)

train_r2 = r2_score(y_train, train_predicted_time)

print(f"Train R² Score: {train_r2 * 100:.2f}%")
joblib.dump(model,model_path/"time.pkl")
joblib.dump(weekend,model_path/"weekend.pkl")
joblib.dump(month,model_path/"month.pkl")
joblib.dump(traffic,model_path/"traffic.pkl")
joblib.dump(weather,model_path/"weather.pkl")
joblib.dump(festival,model_path/"festival.pkl")