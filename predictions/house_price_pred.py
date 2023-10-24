import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from statsmodels.tsa.statespace.sarimax import SARIMAX
import json 

def predict_house_price(city, state):

    # Load Data and format Date column
    df = pd.read_csv('house_price_data.csv')
    df['Date'] = pd.to_datetime(df['Date'])
    pd.options.display.float_format = "{:.2f}".format

    # Filter the dataframe by city and state
    filter = (df['City'] == city) & (df['State'] == state)
    filtered_df = df.loc[filter]

    # Convert the 'Date' column to a DatetimeIndex
    filtered_df.index = pd.to_datetime(filtered_df['Date'], format='%Y-%m-%d')

    # Drop the 'Date' column and resample the filtered dataframe to monthly frequency
    df_monthly = filtered_df.drop('Date', axis=1).resample('MS').median()

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

    # Plot the combined dataframe as a line chart
    # plt.figure(figsize=(10, 6))
    # plt.plot(combined_df.index[:len(df_monthly)], combined_df['Price'][:len(df_monthly)], label='Price')
    # plt.plot(combined_df.index[len(df_monthly):], combined_df['Price'][len(df_monthly):], color='orange', label='Forecast')
    # plt.title(f'House Prices in {city}, {state}')
    # plt.xlabel('Year')
    # plt.ylabel('Price')
    # plt.legend()
    # plt.show()
    
    return json.dumps(forecast_tuples)