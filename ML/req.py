python -m venv venv
venv\Scripts\activate
pip install pandas numpy scikit-learn matplotlib seaborn joblib
distance_km	Missing values, invalid values (0, negative, >=15), numeric type, outliers.
order_time	Missing values and valid time format. Your dataset should contain only normal HH:MM times.
order_items	Missing values, numeric type, 0/negative values, unrealistic high values.
weekend	Missing values, extra spaces, uppercase/lowercase differences, invalid categories. Only weekend / non_weekend.
month	Missing values, spaces/case differences, invalid month names. Do not correct spelling errors because your new dataset should already have correct spellings.
traffic	Missing values, spaces/case differences, invalid categories.
weather	Missing values, spaces/case differences, invalid categories, seasonal/business-rule violations.
rider_rating	Missing values, numeric type, values outside 1–5, possible outliers.
festival	Missing values, spaces/case differences, invalid festival names. No spelling errors should exist in the dataset.
restaurant_order_queue	Missing values, numeric type, negative/invalid values, unrealistic values.
delivery_time_mins	Missing target values, numeric type, unrealistic/outlier values. Don't blindly remove legitimate high delivery times.
