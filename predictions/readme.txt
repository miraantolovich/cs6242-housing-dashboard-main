Make sure you have installed Flask web service (I ran everything locally on my laptop so I had to install Flask CORS to avoid potantial problems.)

Go to the folder that you have all the files and run the following command:
python app.py

This will start a local web server, typically at http://localhost:5000.

Then from your localhost, you can open predict.html
I added a simple drop-down menu and a few cities there just to test the code. Select a city and if you keep browser console open, you can see that the whole data plus prediction is available via predict.js

Apparently the data file is big to upload in github but you can find it in our Team SharePoint:
https://gtvault.sharepoint.com/:x:/s/CSE6242408/Ef9Wql4LHJtBsIk52xUQR64ByqBKpD4gO6ijpzVJr_Qibw?e=LbaaWW
Just remember to rename it to 'Time_Series_House_Price_City_00_22.csv' or simply update the file name in house_price_pred.py

house_price_prediction.ipynb is only for you to follow the logic and parameters of SARIMA model, we don't need it for our dashboard.
