import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from statsmodels.tsa.statespace.sarimax import SARIMAX
import json

def fill_missing_months(df, city, state):
    df_city = df[(df['City'] == city) & (df['State'] == state)].copy()
    df_city['Date'] = pd.to_datetime(df_city['Date'])
    df_city.index = df_city['Date']
    df_city = df_city.resample('MS').mean()

    # Linear interpolation for missing values
    df_city['Price'].interpolate(method='linear', inplace=True)

    df_city['City'] = city
    df_city['State'] = state

    return df_city.reset_index()

def predict_house_price(city, state):

    # Load Data and format Date column
    df = pd.read_csv('house_price_data.csv')
    df['Date'] = pd.to_datetime(df['Date'])
    pd.options.display.float_format = "{:.2f}".format

    # filled_df = fill_missing_months(df, city, state)
    filled_df = fill_missing_months(df, city, state)

    # Convert the 'Date' column to a DatetimeIndex
    filled_df.index = pd.to_datetime(filled_df['Date'], format='%Y-%m-%d')

    # Drop the 'Date' column and resample the filtered dataframe to monthly frequency
    df_monthly = filled_df.drop('Date', axis=1).resample('MS').mean()

    # Define the SARIMA model parameters
    order = (1, 1, 1)
    seasonal_order = (0, 0, 0, 12)

    # Fit the SARIMA model to the resampled dataframe
    model = SARIMAX(df_monthly['Price'], order=order, seasonal_order=seasonal_order)
    results = model.fit()

    # Get the forecasted values for the next 12 months
    forecast = results.get_forecast(steps=12)
    forecast_df = forecast.predicted_mean.to_frame(name='Price')

    # Concatenate the filtered and forecasted dataframes
    combined_df = pd.concat([df_monthly, forecast_df])

    # Create a list of tuples containing the year, month, and predicted price for each of the 12 forecasted months
    forecast_tuples = [(str(date.year), str(date.month), price) for date, price in zip(combined_df.index, combined_df['Price'])]

    return json.dumps(forecast_tuples)
